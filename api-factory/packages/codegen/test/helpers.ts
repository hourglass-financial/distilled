import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect } from "vitest";
import {
  generateToDir,
  type ClientIr,
  type GenerateOptions,
} from "../src/index.ts";

export const packageRoot = fileURLToPath(new URL("../", import.meta.url));
export const goldensRoot = join(packageRoot, "goldens");

const listFiles = (
  root: string,
  current = root,
  ignoredTopLevel: ReadonlySet<string> = new Set(),
): ReadonlyArray<string> =>
  readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
    if (current === root && ignoredTopLevel.has(entry.name)) return [];
    const path = join(current, entry.name);
    return entry.isDirectory()
      ? listFiles(root, path, ignoredTopLevel)
      : [path.slice(root.length + 1)];
  });

const firstDifference = (expected: string, actual: string): string => {
  const expectedLines = expected.split("\n");
  const actualLines = actual.split("\n");
  const length = Math.max(expectedLines.length, actualLines.length);
  for (let index = 0; index < length; index += 1) {
    if (expectedLines[index] !== actualLines[index]) {
      return `line ${index + 1}\n- ${expectedLines[index] ?? "<missing>"}\n+ ${actualLines[index] ?? "<missing>"}`;
    }
  }
  return "unknown byte difference";
};

export const expectTreesEqual = (
  expectedRoot: string,
  actualRoot: string,
  options: {
    readonly ignoredExpectedTopLevel?: ReadonlyArray<string>;
  } = {},
): void => {
  const expectedFiles = [
    ...listFiles(
      expectedRoot,
      expectedRoot,
      new Set(options.ignoredExpectedTopLevel),
    ),
  ].sort();
  const actualFiles = [...listFiles(actualRoot)].sort();
  expect(actualFiles, "emitted file set").toEqual(expectedFiles);
  for (const path of expectedFiles) {
    const expected = readFileSync(join(expectedRoot, path), "utf8");
    const actual = readFileSync(join(actualRoot, path), "utf8");
    expect(actual, `${path}: ${firstDifference(expected, actual)}`).toBe(
      expected,
    );
  }
};

export const emitToTemp = (
  ir: ClientIr,
  options: GenerateOptions = {},
): string => {
  const dir = mkdtempSync(join(tmpdir(), "api-factory-codegen-test-"));
  generateToDir(ir, dir, options);
  return dir;
};

export const removeTemp = (dir: string): void => {
  rmSync(dir, { recursive: true, force: true });
};

export const prepareGolden = (name: string, ir: ClientIr): string => {
  const dir = join(goldensRoot, name);
  if (process.env.UPDATE_GOLDENS === "1") {
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    generateToDir(ir, dir);
  }
  return dir;
};
