import { mkdtempSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as Schema from "effect/Schema";
import * as T from "../src/traits.ts";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  expectTypeOf,
  it,
} from "vitest";
import { generateFromOpenAPI } from "../scripts/generate-openapi.ts";
import { StructWithAdditionalProperties } from "../src/openapi-additional-properties.ts";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspaceDir = resolve(packageRoot, "../../.ai-workspace");
const fixturePath = join(
  packageRoot,
  "test/fixtures/openapi/mixed-properties-additional-properties.json",
);
mkdirSync(workspaceDir, { recursive: true });
const outputDir = mkdtempSync(
  join(workspaceDir, "distilled-openapi-generator-"),
);
const patchesDir = join(outputDir, "patches");
const generatedDir = join(outputDir, "operations");

let generatedSource: string;
let inputSchema: Schema.Top;
let outputSchema: Schema.Top;

beforeAll(async () => {
  mkdirSync(patchesDir, { recursive: true });
  generateFromOpenAPI({
    specPath: fixturePath,
    patchDir: patchesDir,
    outputDir: generatedDir,
    importPrefix: resolve(packageRoot, "src"),
    clientImport: resolve(packageRoot, "test/fixtures/openapi/client"),
    traitsImport: resolve(packageRoot, "src/traits"),
    sensitiveImport: resolve(packageRoot, "src/sensitive"),
    errorsImport: resolve(packageRoot, "src/errors"),
    additionalPropertiesImport: resolve(
      packageRoot,
      "src/openapi-additional-properties.ts",
    ),
  });

  const generatedPath = join(generatedDir, "getMixedObject.ts");
  generatedSource = readFileSync(generatedPath, "utf8");
  const generated = await import(
    /* @vite-ignore */ `${pathToFileURL(generatedPath).href}?test=${Date.now()}`
  );
  inputSchema = generated.GetMixedObjectInput;
  outputSchema = generated.GetMixedObjectOutput;
});

afterAll(() => {
  rmSync(outputDir, { recursive: true, force: true });
});

const validInput = {
  untyped: { known: "declared", arbitrary: { nested: true } },
  typed: { known: 42, arbitrary: "additional" },
  implicitTyped: { known: 42, arbitrary: "additional" },
  closed: { known: "declared", stripped: "closed" },
  omitted: { known: "declared", stripped: "omitted" },
  referenced: { known: 42, arbitrary: "additional" },
  strictValues: {
    known: { type: "text", value: "declared" },
    arbitrary: { type: "boolean", value: true },
    empty: { type: "empty", value: null },
  },
  nullableStrictValue: null,
  genericAnyOf: "supported",
  genericOneOf: 42,
};

describe("OpenAPI mixed object generation", () => {
  it("keeps declared property types assignable alongside typed additional values", () => {
    const mixedSchema = StructWithAdditionalProperties(
      Schema.Struct({ known: Schema.Number }),
      Schema.String,
    );

    expectTypeOf<{ known: number; arbitrary: string }>().toMatchTypeOf<
      typeof mixedSchema.Type
    >();
    expectTypeOf<(typeof mixedSchema.Type)["known"]>().toEqualTypeOf<number>();
  });

  it("preserves declared and untyped additional properties", () => {
    const decoded = Schema.decodeUnknownSync(outputSchema)(validInput) as any;

    expect(decoded.untyped).toEqual(validInput.untyped);
    expect(generatedSource).toContain("StructWithAdditionalProperties");
    expect(generatedSource).toMatch(
      /typed:\s*\{\s*known:\s*number\s*\}\s*&\s*Record<string,\s*string\s*\|\s*number>/,
    );
    expect(generatedSource).toMatch(
      /untyped:\s*\{\s*known:\s*string\s*\}\s*&\s*Record<string,\s*unknown>/,
    );
  });

  it("includes header parameters in the runtime schema and explicit input type", () => {
    const decoded = Schema.decodeUnknownSync(inputSchema)({
      xRequiredCount: 2,
      xMode: "fast",
    }) as any;

    expect(decoded).toEqual({ xRequiredCount: 2, xMode: "fast" });
    expect(generatedSource).toMatch(/xRequiredCount:\s*number/);
    expect(generatedSource).toMatch(/xMode\?:\s*"fast"\s*\|\s*"safe"/);
  });

  it("preserves query wire names and deepObject serialization metadata", () => {
    const decoded = Schema.decodeUnknownSync(inputSchema)({
      xRequiredCount: 2,
      filterOptions: { status: "active", tags: ["one", "two"] },
      pageSize: 25,
    }) as any;
    const parts = T.buildRequestParts(
      inputSchema.ast,
      T.getHttpTrait(inputSchema.ast)!,
      decoded,
      inputSchema,
    );

    expect(parts.query).toEqual({
      "filter-options[status]": "active",
      "filter-options[tags]": ["one", "two"],
      "page-size": "25",
    });
    expect(generatedSource).toContain(
      'T.HttpQuery("filter-options", { style: "deepObject", explode: true })',
    );
    expect(generatedSource).toContain('T.HttpQuery("page-size")');
    expect(generatedSource).toMatch(/filterOptions\?:/);
    expect(generatedSource).toMatch(/pageSize\?:\s*number/);
  });

  it("preserves and validates schema-valued additional properties", () => {
    const decoded = Schema.decodeUnknownSync(outputSchema)(validInput) as any;
    const encoded = Schema.encodeSync(outputSchema)(decoded) as any;

    expect(decoded.typed).toEqual(validInput.typed);
    expect(decoded.implicitTyped).toEqual(validInput.implicitTyped);
    expect(decoded.referenced).toEqual(validInput.referenced);
    expect(encoded.typed).toEqual(validInput.typed);
    expect(encoded.implicitTyped).toEqual(validInput.implicitTyped);
    expect(() =>
      Schema.decodeUnknownSync(outputSchema)({
        ...validInput,
        typed: { known: "declared", arbitrary: 42 },
      }),
    ).toThrow();
  });

  it("leaves false and omitted additional-properties behavior unchanged", () => {
    const decoded = Schema.decodeUnknownSync(outputSchema)(validInput) as any;

    expect(decoded.closed).toEqual({ known: "declared" });
    expect(decoded.omitted).toEqual({ known: "declared" });
  });

  it("renders discriminated and generic OpenAPI unions", () => {
    const decoded = Schema.decodeUnknownSync(outputSchema)(validInput) as any;

    expect(decoded.strictValues).toEqual(validInput.strictValues);
    expect(decoded.nullableStrictValue).toBeNull();
    expect(decoded.genericAnyOf).toBe("supported");
    expect(decoded.genericOneOf).toBe(42);
    expect(generatedSource).toMatch(/emptyUnion\?:\s*never/);
    expect(() =>
      Schema.decodeUnknownSync(outputSchema)({
        ...validInput,
        emptyUnion: null,
      }),
    ).toThrow();
    const nullableValue = Schema.decodeUnknownSync(outputSchema)({
      ...validInput,
      nullableStrictValue: { type: "text", value: "not-null" },
    }) as any;
    expect(nullableValue.nullableStrictValue).toEqual({
      type: "text",
      value: "not-null",
    });
    expect(() =>
      Schema.decodeUnknownSync(outputSchema)({
        ...validInput,
        genericAnyOf: { noLonger: "unknown" },
      }),
    ).toThrow();
    expect(() =>
      Schema.decodeUnknownSync(outputSchema)({
        ...validInput,
        strictValues: {
          known: { type: "text", value: 42 },
        },
      }),
    ).toThrow();
    expect(() =>
      Schema.decodeUnknownSync(outputSchema)({
        ...validInput,
        strictValues: {
          known: { type: "empty", value: "not-null" },
        },
      }),
    ).toThrow();
  });
});
