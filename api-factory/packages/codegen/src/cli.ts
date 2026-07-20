import { readFileSync, writeFileSync } from "node:fs";
import { CodegenError } from "./errors.ts";
import { acquire } from "./frontends/openapi/acquisition.ts";
import { auditPatchLocality } from "./frontends/openapi/audit.ts";
import { buildVendorIr } from "./frontends/openapi/frontend.ts";
import { printJson, type JsonValue } from "./frontends/openapi/json.ts";
import { diffSpecs } from "./frontends/openapi/spec-diff.ts";
import { auditAttestation } from "./frontends/openapi/vendor-dir.ts";
import { canonicalize } from "./ir/canonical.ts";
import { decodeIr, dumpIr } from "./ir/dump.ts";
import { checkInvariants } from "./ir/invariants.ts";
import type { ClientIr } from "./ir/model.ts";
import {
  generateToDir,
  verifyAgainstDir,
  type GenerateOptions,
} from "./pipeline.ts";

const usage = [
  "usage:",
  "  generate (--ir <file.json> | --vendor <dir> [--reconcile <report.json>]) --out <dir>",
  "  --emit-ir (--ir <file.json> | --vendor <dir>)",
  "  verify (--ir <file.json> | --vendor <dir>) --against <dir>",
  "  acquire --vendor <dir> --source <url-or-path> [--ref <upstream-ref>] [--format json|yaml]",
  "  audit-attestation --vendor <dir>",
  "  audit-patches --vendor <dir>",
  "  spec-diff --before <file.json> --after <file.json>",
].join("\n");

const fail = (rule: string, construct: string, message: string): never => {
  throw new CodegenError([{ rule, construct, message }]);
};

const valueFor = (args: ReadonlyArray<string>, flag: string): string => {
  const index = args.indexOf(flag);
  const value = index === -1 ? undefined : args[index + 1];
  if (value === undefined || value.startsWith("--")) {
    return fail("cli.arguments", flag, `missing required ${flag} value`);
  }
  return value;
};

const optionalValueFor = (
  args: ReadonlyArray<string>,
  flag: string,
): string | undefined => {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (value === undefined || value.startsWith("--")) {
    return fail("cli.arguments", flag, `missing ${flag} value`);
  }
  return value;
};

const readJson = (path: string, rule: string): unknown => {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (cause) {
    return fail(
      rule,
      path,
      cause instanceof Error ? cause.message : String(cause),
    );
  }
};

interface ResolvedInput {
  readonly ir: ClientIr;
  readonly generateOptions: GenerateOptions;
  readonly reconcileReportPath: string | undefined;
}

/**
 * Resolve the IR source: `--ir <file.json>` (the raw engine interchange,
 * ADR-0002) or `--vendor <dir>` (the OpenAPI frontend, #48). Exactly one.
 */
const resolveInput = (
  args: ReadonlyArray<string>,
  options: { readonly allowReconcile: boolean } = { allowReconcile: false },
): ResolvedInput => {
  const irPath = optionalValueFor(args, "--ir");
  const vendorDir = optionalValueFor(args, "--vendor");
  const reconcileReportPath = optionalValueFor(args, "--reconcile");
  if ((irPath === undefined) === (vendorDir === undefined)) {
    return fail(
      "cli.arguments",
      "--ir/--vendor",
      "exactly one of --ir and --vendor is required",
    );
  }
  // Reconciliation is a generate-only affordance: running the verify gate or
  // an IR dump in lenient patch mode would defeat their point.
  if (reconcileReportPath !== undefined && !options.allowReconcile) {
    return fail(
      "cli.arguments",
      "--reconcile",
      "--reconcile is only valid on generate",
    );
  }
  if (reconcileReportPath !== undefined && vendorDir === undefined) {
    return fail(
      "cli.arguments",
      "--reconcile",
      "--reconcile requires --vendor",
    );
  }
  if (irPath !== undefined) {
    return {
      ir: decodeIr(readJson(irPath, "cli.ir-json")),
      generateOptions: {},
      reconcileReportPath: undefined,
    };
  }
  const build = buildVendorIr(
    vendorDir!,
    reconcileReportPath === undefined ? "strict" : "reconcile",
  );
  if (reconcileReportPath !== undefined) {
    const report = build.reconciliation!;
    writeFileSync(
      reconcileReportPath,
      printJson(report as unknown as JsonValue),
    );
    if (!report.clean) {
      const flagged = report.entries.filter(
        (entry) => entry.classification !== "still_needed",
      );
      process.stderr.write(
        `reconciliation: ${flagged.length} entr${flagged.length === 1 ? "y" : "ies"} need attention (${flagged
          .map((entry) => `${entry.id}: ${entry.classification}`)
          .join(", ")}); the report gates the PR\n`,
      );
    }
  }
  return {
    ir: build.ir,
    generateOptions: { provenance: build.provenance },
    reconcileReportPath,
  };
};

export const runCli = async (args: ReadonlyArray<string>): Promise<number> => {
  try {
    if (args[0] === "--emit-ir") {
      const input = resolveInput(args);
      const ir = canonicalize(input.ir);
      checkInvariants(ir);
      process.stdout.write(dumpIr(ir));
      return 0;
    }
    if (args[0] === "generate") {
      const input = resolveInput(args, { allowReconcile: true });
      generateToDir(input.ir, valueFor(args, "--out"), input.generateOptions);
      return 0;
    }
    if (args[0] === "verify") {
      const input = resolveInput(args);
      const result = verifyAgainstDir(
        input.ir,
        valueFor(args, "--against"),
        input.generateOptions,
      );
      for (const path of result.missing)
        process.stderr.write(`missing ${path}\n`);
      for (const path of result.extra) process.stderr.write(`extra ${path}\n`);
      for (const path of result.changed)
        process.stderr.write(`changed ${path}\n`);
      return result.missing.length +
        result.extra.length +
        result.changed.length >
        0
        ? 2
        : 0;
    }
    if (args[0] === "acquire") {
      const format = optionalValueFor(args, "--format");
      if (format !== undefined && format !== "json" && format !== "yaml") {
        return fail(
          "cli.arguments",
          "--format",
          `--format must be json or yaml, received ${JSON.stringify(format)}`,
        );
      }
      const result = await acquire({
        vendorDir: valueFor(args, "--vendor"),
        source: valueFor(args, "--source"),
        upstreamRef: optionalValueFor(args, "--ref"),
        sourceFormat: format as "json" | "yaml" | undefined,
      });
      process.stdout.write(printJson(result as unknown as JsonValue));
      return 0;
    }
    if (args[0] === "audit-attestation") {
      const result = auditAttestation(valueFor(args, "--vendor"));
      process.stdout.write(printJson(result as unknown as JsonValue));
      return result.ok ? 0 : 2;
    }
    if (args[0] === "audit-patches") {
      const result = auditPatchLocality(valueFor(args, "--vendor"));
      process.stdout.write(printJson(result as unknown as JsonValue));
      return result.ok ? 0 : 2;
    }
    if (args[0] === "spec-diff") {
      const before = readJson(valueFor(args, "--before"), "cli.spec-json");
      const after = readJson(valueFor(args, "--after"), "cli.spec-json");
      const result = diffSpecs(before as JsonValue, after as JsonValue);
      process.stdout.write(printJson(result as unknown as JsonValue));
      return 0;
    }
    return fail("cli.arguments", "command", usage);
  } catch (error) {
    const codegenError =
      error instanceof CodegenError
        ? error
        : new CodegenError([
            {
              rule: "cli.failure",
              construct: "command",
              message: error instanceof Error ? error.message : String(error),
            },
          ]);
    process.stderr.write(`${codegenError.message}\n`);
    return 1;
  }
};

if (import.meta.main) process.exit(await runCli(process.argv.slice(2)));
