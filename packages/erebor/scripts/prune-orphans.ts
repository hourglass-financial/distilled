#!/usr/bin/env bun
/**
 * Hourglass fork-local helper — prune orphaned operations after a spec update.
 *
 * The shared OpenAPI generator (`@distilled.cloud/core/openapi/generate`)
 * rewrites every operation file present in the *current* spec and fully
 * regenerates the `index.ts` barrel, but it never DELETES operation files for
 * endpoints that disappeared from the spec. After Erebor removes or renames an
 * endpoint, the stale `src/operations/<op>.ts` lingers on disk (no longer
 * exported by the barrel) along with its `test/<op>.test.ts`, which would still
 * call a dead endpoint.
 *
 * This script closes that gap deterministically: it treats the regenerated
 * barrel as the source of truth and removes any operation file (and its
 * matching test file) that the barrel no longer exports. It does NOT touch the
 * spec, patches, or anything else — run it AFTER `bun run generate`.
 *
 * Usage:
 *   bun run scripts/prune-orphans.ts            # delete orphans
 *   bun run scripts/prune-orphans.ts --dry-run  # report only, delete nothing
 */
import * as fs from "fs";
import * as path from "path";

const pkgDir = path.join(import.meta.dir, "..");
const opsDir = path.join(pkgDir, "src", "operations");
const testDir = path.join(pkgDir, "test");
const barrelPath = path.join(opsDir, "index.ts");

const dryRun = process.argv.includes("--dry-run");

// The barrel is the source of truth: collect every module it re-exports.
const barrel = fs.readFileSync(barrelPath, "utf-8");
const exported = new Set<string>();
for (const m of barrel.matchAll(/export \* from "\.\/([^"]+?)(?:\.ts)?";/g)) {
  exported.add(m[1]!);
}

const opFiles = fs
  .readdirSync(opsDir)
  .filter((f) => f.endsWith(".ts") && f !== "index.ts")
  .map((f) => f.replace(/\.ts$/, ""));

const orphans = opFiles.filter((name) => !exported.has(name));

if (orphans.length === 0) {
  console.log(
    `✓ No orphaned operations. ${opFiles.length} operation files all exported by the barrel.`,
  );
  process.exit(0);
}

console.log(
  `${dryRun ? "[dry-run] " : ""}Found ${orphans.length} orphaned operation(s) no longer in the spec:`,
);

for (const name of orphans) {
  const opFile = path.join(opsDir, `${name}.ts`);
  const testFile = path.join(testDir, `${name}.test.ts`);
  const hasTest = fs.existsSync(testFile);
  console.log(
    `  - ${name}  (op: src/operations/${name}.ts${hasTest ? `, test: test/${name}.test.ts` : ", no test file"})`,
  );
  if (!dryRun) {
    fs.rmSync(opFile, { force: true });
    if (hasTest) fs.rmSync(testFile, { force: true });
  }
}

console.log(
  dryRun
    ? `\n[dry-run] Nothing deleted. Re-run without --dry-run to remove ${orphans.length} orphan(s).`
    : `\nRemoved ${orphans.length} orphaned operation(s) and their test files. Re-run \`bun run generate\` is NOT needed (barrel already excludes them).`,
);
