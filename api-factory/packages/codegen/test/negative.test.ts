import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { CodegenError, generate, type Formatter } from "../src/index.ts";
import { minimalFixture } from "./fixtures/minimal.ts";
import { packageRoot } from "./helpers.ts";

const identity: Formatter = (files) => files;

const expectRule = (
  fn: () => unknown,
  rule: string,
  operation: string,
): void => {
  try {
    fn();
    throw new Error("expected code generation to fail");
  } catch (error) {
    expect(error).toBeInstanceOf(CodegenError);
    expect((error as CodegenError).violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rule, construct: `operation ${operation}` }),
      ]),
    );
  }
};

describe("fail-closed pipeline paths", () => {
  it("rejects a dropped dispatch emission independently", () => {
    expectRule(
      () =>
        generate(minimalFixture, {
          formatter: identity,
          transformEmittedFiles: (files) =>
            files.map((file) =>
              file.dispatchOps.length === 0
                ? file
                : { ...file, dispatchOps: [] },
            ),
        }),
      "accounting.dispatch.missing",
      "widgets.get",
    );
  });

  it("rejects a dropped registry entry independently", () => {
    expectRule(
      () =>
        generate(minimalFixture, {
          formatter: identity,
          transformEmittedFiles: (files) =>
            files.map((file) =>
              file.registryOps.length === 0
                ? file
                : { ...file, registryOps: [] },
            ),
        }),
      "accounting.registry.missing",
      "widgets.get",
    );
  });

  it("hard-fails when formatter output never stabilizes", () => {
    const unstable: Formatter = (files) =>
      files.map((file, index) =>
        index === 0
          ? {
              ...file,
              contents: file.contents.endsWith("// flip\n")
                ? file.contents.slice(0, -8)
                : `${file.contents}// flip\n`,
            }
          : file,
      );
    expect(() => generate(minimalFixture, { formatter: unstable })).toThrow(
      /oxfmt-unstable output after 5 passes/,
    );
  });

  it("rejects a declared binding colliding with an imported schema or error name", () => {
    const schemaCollision = JSON.parse(
      JSON.stringify(minimalFixture),
    ) as typeof minimalFixture;
    const renamed = schemaCollision as unknown as {
      namedSchemas: Array<{ name: string }>;
      resources: Array<{
        operations: Array<{ output: { name: string }; errors: string[] }>;
      }>;
    };
    renamed.namedSchemas[0]!.name = "GetWidgetInput";
    renamed.resources[0]!.operations[0]!.output.name = "GetWidgetInput";
    expectRule(
      () => generate(schemaCollision, { formatter: identity }),
      "identifier.import-collision",
      "widgets.get inputName",
    );

    const errorCollision = JSON.parse(
      JSON.stringify(minimalFixture),
    ) as typeof minimalFixture;
    (
      errorCollision as unknown as {
        resources: Array<{ operations: Array<{ errorsName: string }> }>;
      }
    ).resources[0]!.operations[0]!.errorsName = "NotFound";
    expectRule(
      () => generate(errorCollision, { formatter: identity }),
      "identifier.import-collision",
      "widgets.get errorsName",
    );
  });

  it("returns exit 1 for invalid CLI IR JSON", () => {
    const dir = mkdtempSync(join(tmpdir(), "api-factory-codegen-negative-"));
    try {
      const path = join(dir, "invalid.json");
      writeFileSync(path, "{ invalid");
      const result = spawnSync(
        "bun",
        ["run", "src/cli.ts", "--emit-ir", "--ir", path],
        { cwd: packageRoot, encoding: "utf8" },
      );
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("cli.ir-json");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
