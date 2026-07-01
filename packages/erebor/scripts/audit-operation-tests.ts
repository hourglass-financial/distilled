#!/usr/bin/env bun
/**
 * Check that generated Erebor operations and live tests stay paired.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const pkgDir = path.join(here, "..");
const opsDir = path.join(pkgDir, "src", "operations");
const testDir = path.join(pkgDir, "test");
const barrelPath = path.join(opsDir, "index.ts");

const args = new Set(process.argv.slice(2));
const pretty = args.has("--pretty");
const strict = args.has("--strict");

if (args.has("--help") || args.has("-h")) {
  console.log(
    [
      "Usage: bun run scripts/audit-operation-tests.ts [--pretty] [--strict]",
      "",
      "--strict exits nonzero when exported operations are missing tests.",
    ].join("\n"),
  );
  process.exit(0);
}

const barrel = fs.readFileSync(barrelPath, "utf-8");
const exportedOperations = Array.from(
  barrel.matchAll(/export \* from "\.\/([^"]+?)(?:\.ts)?";/g),
  (match) => match[1]!,
).sort();

const operationSet = new Set(exportedOperations);
const operationTests = fs
  .readdirSync(testDir)
  .filter((file) => file.endsWith(".test.ts") && file !== "errors.test.ts")
  .map((file) => file.replace(/\.test\.ts$/, ""))
  .sort();
const testSet = new Set(operationTests);

const missingTests = exportedOperations.filter((name) => !testSet.has(name));
const orphanTests = operationTests.filter((name) => !operationSet.has(name));

const result = {
  exportedOperationCount: exportedOperations.length,
  operationTestCount: operationTests.length,
  missingTests,
  orphanTests,
  ok: missingTests.length === 0 && orphanTests.length === 0,
};

console.log(JSON.stringify(result, null, pretty ? 2 : 0));

if (strict && missingTests.length > 0) {
  process.exit(1);
}
