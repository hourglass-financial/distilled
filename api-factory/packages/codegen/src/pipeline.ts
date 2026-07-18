import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { CodegenError, type CodegenViolation } from "./errors.ts";
import { emitBarrel } from "./emit/barrel.ts";
import { emitClient } from "./emit/client.ts";
import { emitConfig } from "./emit/config.ts";
import { emitConsistencyTest } from "./emit/consistency-test.ts";
import { emitErrors } from "./emit/errors.ts";
import { emitManifest } from "./emit/manifest.ts";
import { emitRegistry } from "./emit/registry.ts";
import { emitResources } from "./emit/resources.ts";
import { emitScaffold } from "./emit/scaffold.ts";
import { emitSchemas } from "./emit/schemas.ts";
import { codeUnitCompare, type EmittedFile } from "./emit/shared.ts";
import { canonicalize } from "./ir/canonical.ts";
import { decodeIr } from "./ir/dump.ts";
import { checkInvariants } from "./ir/invariants.ts";
import type { ClientIr } from "./ir/model.ts";

export type Formatter = (
  files: ReadonlyArray<EmittedFile>,
) => ReadonlyArray<EmittedFile>;

export interface GenerateOptions {
  readonly formatter?: Formatter;
  readonly engineVersion?: string;
  readonly transformEmittedFiles?: (
    files: ReadonlyArray<EmittedFile>,
  ) => ReadonlyArray<EmittedFile>;
}

export interface VerifyResult {
  readonly missing: ReadonlyArray<string>;
  readonly extra: ReadonlyArray<string>;
  readonly changed: ReadonlyArray<string>;
}

const workspaceDir = fileURLToPath(new URL("../../../", import.meta.url));
const packageDir = fileURLToPath(new URL("../", import.meta.url));
const oxfmtBin = join(workspaceDir, "node_modules", ".bin", "oxfmt");
const oxfmtConfig = join(workspaceDir, ".oxfmtrc.json");

const defaultEngineVersion = (): string => {
  const value = JSON.parse(
    readFileSync(join(packageDir, "package.json"), "utf8"),
  ) as { readonly version?: unknown };
  if (typeof value.version !== "string") {
    throw new CodegenError([
      {
        rule: "manifest.engine-version",
        construct: "packages/codegen/package.json",
        message: "package version is absent or not a string",
      },
    ]);
  }
  return value.version;
};

const writeFiles = (files: ReadonlyArray<EmittedFile>, dir: string): void => {
  for (const file of files) {
    const path = join(dir, file.path);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, file.contents);
  }
};

export const formatWithOxfmt: Formatter = (files) => {
  const tsFiles = files.filter((file) => file.path.endsWith(".ts"));
  if (tsFiles.length === 0) return files;
  const temp = mkdtempSync(join(tmpdir(), "api-factory-codegen-format-"));
  try {
    writeFiles(tsFiles, temp);
    const paths = tsFiles.map((file) => join(temp, file.path));
    const result = spawnSync(
      oxfmtBin,
      ["--write", "-c", oxfmtConfig, ...paths],
      { encoding: "utf8" },
    );
    if (result.status !== 0) {
      throw new CodegenError([
        {
          rule: "format.oxfmt",
          construct: "emitted TypeScript",
          message: (result.stderr || result.stdout || "oxfmt failed").trim(),
        },
      ]);
    }
    const formatted = new Map(
      tsFiles.map((file) => [
        file.path,
        readFileSync(join(temp, file.path), "utf8"),
      ]),
    );
    return files.map((file) => ({
      ...file,
      contents: formatted.get(file.path) ?? file.contents,
    }));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
};

const contentsEqual = (
  left: ReadonlyArray<EmittedFile>,
  right: ReadonlyArray<EmittedFile>,
): boolean =>
  left.length === right.length &&
  left.every(
    (file, index) =>
      file.path === right[index]?.path &&
      file.contents === right[index]?.contents,
  );

const stabilize = (
  files: ReadonlyArray<EmittedFile>,
  formatter: Formatter,
): ReadonlyArray<EmittedFile> => {
  let current = files;
  for (let pass = 1; pass <= 5; pass += 1) {
    const next = formatter(current);
    if (contentsEqual(current, next)) return next;
    current = next;
  }
  throw new CodegenError([
    {
      rule: "format.stability",
      construct: "emitted TypeScript",
      message: "emitter produced oxfmt-unstable output after 5 passes",
    },
  ]);
};

const checkAccountingSet = (
  expected: ReadonlySet<string>,
  actualValues: ReadonlyArray<string>,
  kind: "dispatch" | "registry",
  violations: CodegenViolation[],
): void => {
  const actual = new Set(actualValues);
  for (const operation of expected) {
    if (!actual.has(operation)) {
      violations.push({
        rule: `accounting.${kind}.missing`,
        construct: `operation ${operation}`,
        message: `${kind} emission is missing`,
      });
    }
  }
  for (const operation of actual) {
    if (!expected.has(operation)) {
      violations.push({
        rule: `accounting.${kind}.extra`,
        construct: `operation ${operation}`,
        message: `${kind} emission has no matching IR operation`,
      });
    }
  }
  const counts = new Map<string, number>();
  for (const operation of actualValues) {
    counts.set(operation, (counts.get(operation) ?? 0) + 1);
  }
  for (const [operation, count] of counts) {
    if (count > 1) {
      violations.push({
        rule: `accounting.${kind}.duplicate`,
        construct: `operation ${operation}`,
        message: `${kind} emission occurred ${count} times`,
      });
    }
  }
};

const checkAccounting = (
  ir: ClientIr,
  files: ReadonlyArray<EmittedFile>,
): void => {
  const expected = new Set(
    ir.resources.flatMap((resource) =>
      resource.operations.map(
        (operation) =>
          `${operation.publicName.resource}.${operation.publicName.method}`,
      ),
    ),
  );
  const violations: CodegenViolation[] = [];
  checkAccountingSet(
    expected,
    files.flatMap((file) => file.dispatchOps),
    "dispatch",
    violations,
  );
  checkAccountingSet(
    expected,
    files.flatMap((file) => file.registryOps),
    "registry",
    violations,
  );
  if (violations.length > 0) throw new CodegenError(violations);
};

const emitAll = (ir: ClientIr): ReadonlyArray<EmittedFile> => [
  emitSchemas(ir),
  emitErrors(ir),
  emitClient(ir),
  emitConfig(ir),
  ...emitResources(ir),
  emitRegistry(ir),
  emitBarrel(ir),
  emitConsistencyTest(ir),
  ...emitScaffold(ir),
];

export const generate = (
  input: unknown,
  options: GenerateOptions = {},
): ReadonlyArray<EmittedFile> => {
  const ir = canonicalize(decodeIr(input));
  checkInvariants(ir);
  const emittedFiles =
    options.transformEmittedFiles?.(emitAll(ir)) ?? emitAll(ir);
  const formatted = stabilize(
    emittedFiles,
    options.formatter ?? formatWithOxfmt,
  );
  checkAccounting(ir, formatted);
  return [
    ...formatted,
    emitManifest(formatted, options.engineVersion ?? defaultEngineVersion()),
  ];
};

export const generateToDir = (
  input: unknown,
  dir: string,
  options: GenerateOptions = {},
): ReadonlyArray<EmittedFile> => {
  const files = generate(input, options);
  writeFiles(files, resolve(dir));
  return files;
};

const ignoredVerifyTopLevel = new Set([
  ".turbo",
  "lib",
  "node_modules",
  "tsconfig.test.tsbuildinfo",
  "tsconfig.tsbuildinfo",
]);

const listFiles = (root: string, current = root): ReadonlyArray<string> => {
  const entries = readdirSync(current, { withFileTypes: true });
  return entries.flatMap((entry) => {
    if (current === root && ignoredVerifyTopLevel.has(entry.name)) return [];
    const path = join(current, entry.name);
    if (entry.isDirectory()) return listFiles(root, path);
    return [path.slice(root.length + 1)];
  });
};

export const verifyAgainstDir = (
  input: unknown,
  dir: string,
  options: GenerateOptions = {},
): VerifyResult => {
  const expected = generate(input, options);
  const expectedByPath = new Map(expected.map((file) => [file.path, file]));
  const actualRoot = resolve(dir);
  const actualPaths = [...listFiles(actualRoot)].sort(codeUnitCompare);
  const actualSet = new Set(actualPaths);
  const missing = [...expectedByPath.keys()]
    .filter((path) => !actualSet.has(path))
    .sort(codeUnitCompare);
  const extra = actualPaths
    .filter((path) => !expectedByPath.has(path))
    .sort(codeUnitCompare);
  const changed = actualPaths
    .filter((path) => {
      const file = expectedByPath.get(path);
      return (
        file !== undefined &&
        readFileSync(join(actualRoot, path), "utf8") !== file.contents
      );
    })
    .sort(codeUnitCompare);
  return { missing, extra, changed };
};
