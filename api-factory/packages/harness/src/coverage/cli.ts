/**
 * Coverage audit CLI — the deterministic JSON-out local command (#27 gate 3,
 * #30 decisions 3/5/6). Invoked directly and as a Smithers workflow gate;
 * coverage floors are the caller's policy over this JSON, never enforced
 * here. Prints the report to stdout, human hints (including paste-ready
 * stubs) to stderr, writes nothing.
 *
 * Usage (from a vendor directory):
 *
 * ```
 * bun ../../packages/harness/src/coverage/cli.ts \
 *   --vendor workos \
 *   --registry ../../clients/workos/src/registry.ts \
 *   --manifest ./tests/coverage.ts
 * ```
 *
 * Exit codes: 0 clean, 1 findings, 2 usage/load error.
 */
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { auditCoverage } from "./audit.ts";

interface CliArgs {
  readonly vendor: string;
  readonly registry: string;
  readonly manifest: string;
}

const usage = `usage: cli.ts --vendor <name> --registry <module> --manifest <module>`;

const parseArgs = (argv: readonly string[]): CliArgs | undefined => {
  const values: Record<string, string> = {};
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (
      (flag !== "--vendor" && flag !== "--registry" && flag !== "--manifest") ||
      value === undefined
    ) {
      return undefined;
    }
    values[flag.slice(2)] = value;
  }
  return values.vendor !== undefined &&
    values.registry !== undefined &&
    values.manifest !== undefined
    ? (values as unknown as CliArgs)
    : undefined;
};

const importModule = async (spec: string): Promise<Record<string, unknown>> =>
  (await import(
    pathToFileURL(path.resolve(process.cwd(), spec)).href
  )) as Record<string, unknown>;

const isStringArray = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const main = async (): Promise<number> => {
  const args = parseArgs(process.argv.slice(2));
  if (args === undefined) {
    console.error(usage);
    return 2;
  }

  let registry: readonly string[];
  let manifest: unknown;
  try {
    const registryModule = await importModule(args.registry);
    const operations = registryModule.operations ?? registryModule.default;
    if (!isStringArray(operations)) {
      console.error(
        `registry module ${args.registry} must export \`operations\` (or default-export) an array of operation names`,
      );
      return 2;
    }
    registry = operations;
    const manifestModule = await importModule(args.manifest);
    if (!("default" in manifestModule)) {
      console.error(
        `manifest module ${args.manifest} must default-export the coverage manifest`,
      );
      return 2;
    }
    manifest = manifestModule.default;
  } catch (error) {
    console.error(`failed to load audit inputs: ${String(error)}`);
    return 2;
  }

  const report = auditCoverage({ vendor: args.vendor, registry, manifest });
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok && report.stubs !== "") {
    console.error(
      `\ncoverage audit: ${report.findings.length} finding(s). Paste-ready stubs for missing entries (canonical order):\n${report.stubs}`,
    );
  } else if (!report.ok) {
    console.error(`\ncoverage audit: ${report.findings.length} finding(s).`);
  }
  return report.ok ? 0 : 1;
};

if (import.meta.main) process.exitCode = await main();
