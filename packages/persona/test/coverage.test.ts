import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  coverageInventory,
  operationCoverage,
  operationNames,
  type CoverageStatus,
} from "./coverage.ts";

const testDir = dirname(fileURLToPath(import.meta.url));
const operationTestDir = join(testDir, "operations");
const operationsIndex = join(testDir, "../src/operations/index.ts");

const generatedOperationNames = (): string[] =>
  [
    ...readFileSync(operationsIndex, "utf8").matchAll(
      /^export \* from "\.\/(.+)\.ts";$/gm,
    ),
  ]
    .map((match) => match[1])
    .filter((name): name is string => Boolean(name))
    .sort();

const sourceFor = (operation: string): string =>
  readFileSync(join(operationTestDir, `${operation}.test.ts`), "utf8");

const liveStatuses = new Set<CoverageStatus>([
  "live-lifecycle",
  "live-data",
  "live-envelope",
]);

describe("Persona operation coverage", () => {
  it("has exactly one operation-oriented file for every generated operation", () => {
    expect(operationNames.slice().sort()).toEqual(generatedOperationNames());
    const knownOperations = new Set<string>(operationNames);
    const operationFiles = readdirSync(operationTestDir)
      .filter((name) => name.endsWith(".test.ts"))
      .map((name) => name.replace(/\.test\.ts$/, ""))
      .filter((name) => knownOperations.has(name))
      .sort();
    expect(operationFiles).toEqual(operationNames.slice().sort());

    const misplacedOperationFiles = readdirSync(testDir)
      .filter((name) => name.endsWith(".test.ts"))
      .map((name) => name.replace(/\.test\.ts$/, ""))
      .filter((name) => knownOperations.has(name));
    expect(misplacedOperationFiles).toEqual([]);
  });

  it("keeps each file's visible coverage level aligned with the inventory", () => {
    for (const operation of operationNames) {
      const source = sourceFor(operation);
      const marker = source.match(/^\/\/ Coverage: ([a-z-]+)$/m)?.[1];
      expect(marker, operation).toBe(operationCoverage[operation]);
    }
  });

  it("requires successful coverage files to call their operation directly", () => {
    for (const operation of operationNames) {
      const status = operationCoverage[operation];
      if (!liveStatuses.has(status)) continue;
      const source = sourceFor(operation);
      expect(source, operation).toContain(
        `from "../../src/operations/${operation}.ts"`,
      );
      expect(source, operation).toMatch(/\bit\(/);
      expect(source, operation).not.toContain("it.todo");
    }
  });

  it("represents uncovered operations as explicit pending scenarios", () => {
    for (const operation of operationNames) {
      const status = operationCoverage[operation];
      if (liveStatuses.has(status) || status === "error-only") continue;
      const source = sourceFor(operation);
      expect(source, operation).toContain("it.todo(");
      expect(source, operation).not.toContain("runLiveEffect");
      expect(source, operation).not.toContain("runFailure");
    }
  });

  it("keeps error-only coverage active but distinct from successful coverage", () => {
    for (const operation of operationNames) {
      if (operationCoverage[operation] !== "error-only") continue;
      const source = sourceFor(operation);
      expect(source, operation).toContain(
        `from "../../src/operations/${operation}.ts"`,
      );
      expect(source, operation).toContain("runFailure");
      expect(source, operation).not.toContain("it.todo");
    }
  });

  it("records structured, secret-safe evidence for every non-live operation", () => {
    for (const [operation, entry] of Object.entries(coverageInventory)) {
      if (liveStatuses.has(entry.status)) {
        expect(entry.evidence, operation).toBeUndefined();
        continue;
      }
      expect(entry.evidence?.kind, operation).toMatch(
        /^(documentation|sandbox-observation)$/,
      );
      expect(entry.evidence?.source, operation).toBeTruthy();
      expect(entry.evidence?.prerequisite, operation).toBeTruthy();
      expect(entry.evidence?.lastVerified, operation).toMatch(
        /^\d{4}-\d{2}-\d{2}$/,
      );
      expect(entry.evidence?.promotionCondition, operation).toBeTruthy();

      const serialized = JSON.stringify(entry.evidence).toLowerCase();
      expect(serialized, operation).not.toMatch(
        /persona_sandbox_|bearer\s|api[_-]?key|raw (body|header|response)|customer payload/,
      );
    }
  });

  it("owns invalid-credential behavior only at the client boundary", () => {
    const owners = [
      ...readdirSync(testDir)
        .filter(
          (name) => name.endsWith(".test.ts") && name !== "coverage.test.ts",
        )
        .map((name) => ({ name, path: join(testDir, name) })),
      ...readdirSync(operationTestDir)
        .filter((name) => name.endsWith(".test.ts"))
        .map((name) => ({
          name: `operations/${name}`,
          path: join(operationTestDir, name),
        })),
    ]
      .filter(({ path }) =>
        readFileSync(path, "utf8").includes("runEffectWithInvalidCredentials"),
      )
      .map(({ name }) => name);
    expect(owners).toEqual(["client.test.ts"]);
  });
});
