import { readFileSync } from "node:fs";
import { CodegenError } from "./errors.ts";
import { canonicalize } from "./ir/canonical.ts";
import { decodeIr, dumpIr } from "./ir/dump.ts";
import { checkInvariants } from "./ir/invariants.ts";
import { generateToDir, verifyAgainstDir } from "./pipeline.ts";

const usage =
  "usage: generate --ir <file.json> --out <dir> | --emit-ir --ir <file.json> | verify --ir <file.json> --against <dir>";

const fail = (rule: string, construct: string, message: string): never => {
  throw new CodegenError([{ rule, construct, message }]);
};

const valueFor = (args: ReadonlyArray<string>, flag: string): string => {
  const index = args.indexOf(flag);
  if (index === -1 || args[index + 1] === undefined) {
    return fail("cli.arguments", flag, `missing required ${flag} value`);
  }
  return args[index + 1]!;
};

const readIr = (path: string): unknown => {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (cause) {
    return fail(
      "cli.ir-json",
      path,
      cause instanceof Error ? cause.message : String(cause),
    );
  }
};

export const runCli = (args: ReadonlyArray<string>): number => {
  try {
    if (args[0] === "--emit-ir") {
      const ir = canonicalize(decodeIr(readIr(valueFor(args, "--ir"))));
      checkInvariants(ir);
      process.stdout.write(dumpIr(ir));
      return 0;
    }
    if (args[0] === "generate") {
      generateToDir(readIr(valueFor(args, "--ir")), valueFor(args, "--out"));
      return 0;
    }
    if (args[0] === "verify") {
      const result = verifyAgainstDir(
        readIr(valueFor(args, "--ir")),
        valueFor(args, "--against"),
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

if (import.meta.main) process.exit(runCli(process.argv.slice(2)));
