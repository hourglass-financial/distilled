#!/usr/bin/env bun
/**
 * Deterministic JSON Patch audit for the Erebor patched OpenAPI snapshot.
 *
 * Classifies every patch entry before generation so stale/redundant patch state
 * is explicit instead of discovered by a generator crash or manual inspection.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const pkgDir = path.join(here, "..");
const specPath = path.join(
  pkgDir,
  "specs/distilled-spec-erebor/specs/openapi.json",
);
const patchDir = path.join(pkgDir, "patches");

type PatchOperation = {
  op: "add" | "remove" | "replace" | "test" | string;
  path: string;
  value?: unknown;
};

type PatchFile = {
  description?: string;
  patches?: PatchOperation[];
};

type Classification =
  | "still_needed"
  | "redundant"
  | "stale"
  | "conflict"
  | "unsupported";

const args = new Set(process.argv.slice(2));
const pretty = args.has("--pretty");
const strict = args.has("--strict");
const help = args.has("--help") || args.has("-h");

if (help) {
  console.log(
    [
      "Usage: bun run scripts/audit-patches.ts [--pretty] [--strict]",
      "",
      "--strict exits nonzero when stale, conflict, or unsupported patches exist.",
    ].join("\n"),
  );
  process.exit(0);
}

const deepEqual = (a: unknown, b: unknown): boolean =>
  JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));

const normalize = (value: unknown): unknown => {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(normalize);
  const object = value as Record<string, unknown>;
  return Object.fromEntries(
    Object.keys(object)
      .sort()
      .map((key) => [key, normalize(object[key])]),
  );
};

const decodePointer = (pointer: string): string[] => {
  if (pointer === "") return [];
  if (!pointer.startsWith("/")) {
    throw new Error(`Invalid JSON pointer: ${pointer}`);
  }
  return pointer
    .slice(1)
    .split("/")
    .map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"));
};

const getAt = (
  document: unknown,
  pointer: string,
): { exists: boolean; value: unknown } => {
  let current = document;
  for (const part of decodePointer(pointer)) {
    if (Array.isArray(current)) {
      if (part === "-") return { exists: false, value: undefined };
      const index = Number(part);
      if (!Number.isInteger(index) || index < 0 || index >= current.length) {
        return { exists: false, value: undefined };
      }
      current = current[index];
    } else if (current !== null && typeof current === "object") {
      const object = current as Record<string, unknown>;
      if (!Object.prototype.hasOwnProperty.call(object, part)) {
        return { exists: false, value: undefined };
      }
      current = object[part];
    } else {
      return { exists: false, value: undefined };
    }
  }
  return { exists: true, value: current };
};

const parentPointer = (pointer: string): string | null => {
  const parts = decodePointer(pointer);
  if (parts.length === 0) return null;
  return `/${parts
    .slice(0, -1)
    .map((part) => part.replace(/~/g, "~0").replace(/\//g, "~1"))
    .join("/")}`;
};

const classify = (
  spec: unknown,
  patch: PatchOperation,
): { classification: Classification; reason: string } => {
  const target = getAt(spec, patch.path);

  switch (patch.op) {
    case "add": {
      const parent = parentPointer(patch.path);
      if (parent !== null && !getAt(spec, parent).exists) {
        return {
          classification: "stale",
          reason: `add parent does not exist: ${parent}`,
        };
      }
      if (!target.exists) {
        return {
          classification: "still_needed",
          reason: "target is absent and can be added",
        };
      }
      if (deepEqual(target.value, patch.value)) {
        return {
          classification: "redundant",
          reason: "target already equals patch value",
        };
      }
      return {
        classification: "conflict",
        reason: "add target already exists with a different value",
      };
    }
    case "replace": {
      if (!target.exists) {
        return {
          classification: "stale",
          reason: "replace target does not exist",
        };
      }
      if (deepEqual(target.value, patch.value)) {
        return {
          classification: "redundant",
          reason: "target already equals replacement value",
        };
      }
      return {
        classification: "still_needed",
        reason: "target exists with a different value",
      };
    }
    case "remove": {
      if (!target.exists) {
        return {
          classification: "redundant",
          reason: "remove target is already absent",
        };
      }
      return {
        classification: "still_needed",
        reason: "target exists and would be removed",
      };
    }
    case "test": {
      if (!target.exists) {
        return {
          classification: "stale",
          reason: "test target does not exist",
        };
      }
      if (deepEqual(target.value, patch.value)) {
        return {
          classification: "redundant",
          reason: "test already passes",
        };
      }
      return {
        classification: "conflict",
        reason: "test target exists with a different value",
      };
    }
    default:
      return {
        classification: "unsupported",
        reason: `unsupported patch op: ${patch.op}`,
      };
  }
};

const spec = JSON.parse(fs.readFileSync(specPath, "utf-8"));
const files = fs
  .readdirSync(patchDir)
  .filter((file) => file.endsWith(".patch.json"))
  .sort();

const entries = files.flatMap((file) => {
  const patchPath = path.join(patchDir, file);
  const parsed = JSON.parse(fs.readFileSync(patchPath, "utf-8")) as PatchFile;
  const patches = parsed.patches ?? [];
  return patches.map((patch, index) => {
    const result = classify(spec, patch);
    return {
      file,
      index,
      op: patch.op,
      path: patch.path,
      ...result,
    };
  });
});

const counts = entries.reduce<Record<Classification, number>>(
  (acc, entry) => {
    acc[entry.classification]++;
    return acc;
  },
  {
    still_needed: 0,
    redundant: 0,
    stale: 0,
    conflict: 0,
    unsupported: 0,
  },
);

const result = {
  specPath: path.relative(pkgDir, specPath),
  patchDir: path.relative(pkgDir, patchDir),
  patchFiles: files,
  counts,
  entries,
  ok: counts.stale === 0 && counts.conflict === 0 && counts.unsupported === 0,
};

console.log(JSON.stringify(result, null, pretty ? 2 : 0));

if (strict && !result.ok) {
  process.exit(1);
}
