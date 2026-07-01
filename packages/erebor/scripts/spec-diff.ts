#!/usr/bin/env bun
/**
 * Deterministic Erebor OpenAPI delta reporter.
 *
 * Compares the working-tree OpenAPI snapshot against the version committed at a
 * git ref (HEAD by default) and emits machine-readable JSON. This script does
 * not mutate the repository.
 */
import * as childProcess from "node:child_process";
import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const pkgDir = path.join(here, "..");
const repoRoot = path.join(pkgDir, "..", "..");
const specRelPath =
  "packages/erebor/specs/distilled-spec-erebor/specs/openapi.json";
const specPath = path.join(repoRoot, specRelPath);
const HTTP_METHODS = new Set([
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
]);

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

const parseArgs = (): { baseRef: string; pretty: boolean } => {
  const args = process.argv.slice(2);
  let baseRef = "HEAD";
  let pretty = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--base") {
      baseRef = args[++i] ?? baseRef;
    } else if (arg === "--pretty") {
      pretty = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(
        "Usage: bun run scripts/spec-diff.ts [--base HEAD] [--pretty]",
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return { baseRef, pretty };
};

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  const object = value as Record<string, unknown>;
  return `{${Object.keys(object)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(object[key])}`)
    .join(",")}}`;
};

const sha256 = (value: string): string =>
  crypto.createHash("sha256").update(value).digest("hex");

const readJson = (text: string, label: string): any => {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Failed to parse ${label} as JSON: ${(error as Error).message}`);
  }
};

const readGitFile = (ref: string, relPath: string): string | null => {
  try {
    return childProcess.execFileSync("git", ["show", `${ref}:${relPath}`], {
      cwd: repoRoot,
      encoding: "utf-8",
      maxBuffer: 128 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    return null;
  }
};

const sortedKeys = (value: unknown): string[] =>
  Object.keys((value ?? {}) as Record<string, unknown>).sort();

const pathMethods = (pathItem: unknown): string[] =>
  Object.keys((pathItem ?? {}) as Record<string, unknown>)
    .filter((key) => HTTP_METHODS.has(key))
    .sort();

const operationSummary = (
  spec: any,
): Record<string, { operationId: string | null; responseStatuses: string[] }> => {
  const operations: Record<
    string,
    { operationId: string | null; responseStatuses: string[] }
  > = {};

  for (const pathName of sortedKeys(spec.paths)) {
    const pathItem = spec.paths[pathName];
    for (const method of pathMethods(pathItem)) {
      const op = pathItem[method];
      operations[`${method.toUpperCase()} ${pathName}`] = {
        operationId: op?.operationId ?? null,
        responseStatuses: sortedKeys(op?.responses),
      };
    }
  }

  return operations;
};

const schemaHashes = (spec: any): Record<string, string> => {
  const schemas = spec.components?.schemas ?? {};
  const result: Record<string, string> = {};
  for (const name of sortedKeys(schemas)) {
    result[name] = sha256(stableStringify(schemas[name]));
  }
  return result;
};

const diffSets = (before: string[], after: string[]) => {
  const beforeSet = new Set(before);
  const afterSet = new Set(after);
  return {
    added: after.filter((item) => !beforeSet.has(item)),
    removed: before.filter((item) => !afterSet.has(item)),
    common: after.filter((item) => beforeSet.has(item)),
  };
};

const main = (): void => {
  const { baseRef, pretty } = parseArgs();
  const beforeText = readGitFile(baseRef, specRelPath);
  if (beforeText === null) {
    throw new Error(`Could not read ${specRelPath} at ${baseRef}`);
  }
  const afterText = fs.readFileSync(specPath, "utf-8");

  const beforeSpec = readJson(beforeText, `${baseRef}:${specRelPath}`);
  const afterSpec = readJson(afterText, specPath);

  const beforePaths = sortedKeys(beforeSpec.paths);
  const afterPaths = sortedKeys(afterSpec.paths);
  const pathDiff = diffSets(beforePaths, afterPaths);

  const beforeOps = operationSummary(beforeSpec);
  const afterOps = operationSummary(afterSpec);
  const opDiff = diffSets(sortedKeys(beforeOps), sortedKeys(afterOps));
  const changedOperations = opDiff.common
    .filter(
      (key) =>
        beforeOps[key]?.operationId !== afterOps[key]?.operationId ||
        stableStringify(beforeOps[key]?.responseStatuses) !==
          stableStringify(afterOps[key]?.responseStatuses),
    )
    .map((key) => ({
      operation: key,
      before: beforeOps[key],
      after: afterOps[key],
    }));

  const beforeSchemas = schemaHashes(beforeSpec);
  const afterSchemas = schemaHashes(afterSpec);
  const schemaDiff = diffSets(sortedKeys(beforeSchemas), sortedKeys(afterSchemas));
  const changedSchemas = schemaDiff.common
    .filter((key) => beforeSchemas[key] !== afterSchemas[key])
    .map((key) => ({
      schema: key,
      beforeHash: beforeSchemas[key],
      afterHash: afterSchemas[key],
    }));

  const result = {
    baseRef,
    specPath: specRelPath,
    beforeHash: sha256(beforeText),
    afterHash: sha256(afterText),
    changed: beforeText !== afterText,
    paths: {
      added: pathDiff.added,
      removed: pathDiff.removed,
    },
    operations: {
      added: opDiff.added.map((key) => ({ operation: key, after: afterOps[key] })),
      removed: opDiff.removed.map((key) => ({
        operation: key,
        before: beforeOps[key],
      })),
      changed: changedOperations,
    },
    schemas: {
      added: schemaDiff.added,
      removed: schemaDiff.removed,
      changed: changedSchemas,
    },
  } satisfies Json;

  console.log(JSON.stringify(result, null, pretty ? 2 : 0));
};

try {
  main();
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
