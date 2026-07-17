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
mkdirSync(workspaceDir, { recursive: true });
const fixtureOutputDirs: string[] = [];

function generateFixture(specName: string, outputPrefix: string): string {
  const outputDir = mkdtempSync(join(workspaceDir, outputPrefix));
  const generatedDir = join(outputDir, "operations");
  const specPath = join(packageRoot, "test/fixtures/openapi", specName);
  fixtureOutputDirs.push(outputDir);
  generateFromOpenAPI({
    specPath,
    patchDir: join(outputDir, "patches"),
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
    generatedSchemaImport: resolve(packageRoot, "src/generated-schema.ts"),
  });
  return generatedDir;
}

let generatedSource: string;
let inputSchema: Schema.Top;
let outputSchema: Schema.Top;
let updateMembershipSource: string;
let createMembershipSource: string;
let updateMembershipInputSchema: Schema.Top;
let createMembershipInputSchema: Schema.Top;
let constUnionSource: string;
let constUnionOutputSchema: Schema.Top;

beforeAll(async () => {
  const generatedDir = generateFixture(
    "mixed-properties-additional-properties.json",
    "distilled-openapi-generator-",
  );

  const generatedPath = join(generatedDir, "getMixedObject.ts");
  generatedSource = readFileSync(generatedPath, "utf8");
  const generated = await import(
    /* @vite-ignore */ `${pathToFileURL(generatedPath).href}?test=${Date.now()}`
  );
  inputSchema = generated.GetMixedObjectInput;
  outputSchema = generated.GetMixedObjectOutput;

  const composedRequestBodiesGeneratedDir = generateFixture(
    "composed-request-bodies.json",
    "distilled-openapi-composed-request-bodies-",
  );

  const updateMembershipPath = join(
    composedRequestBodiesGeneratedDir,
    "updateMembership.ts",
  );
  const createMembershipPath = join(
    composedRequestBodiesGeneratedDir,
    "createMembership.ts",
  );
  updateMembershipSource = readFileSync(updateMembershipPath, "utf8");
  createMembershipSource = readFileSync(createMembershipPath, "utf8");
  const updateMembership = await import(
    /* @vite-ignore */ `${pathToFileURL(updateMembershipPath).href}?test=${Date.now()}`
  );
  const createMembership = await import(
    /* @vite-ignore */ `${pathToFileURL(createMembershipPath).href}?test=${Date.now()}`
  );
  updateMembershipInputSchema = updateMembership.UpdateMembershipInput;
  createMembershipInputSchema = createMembership.CreateMembershipInput;

  const constUnionGeneratedDir = generateFixture(
    "const-discriminated-union.json",
    "distilled-openapi-const-union-",
  );
  const constUnionPath = join(constUnionGeneratedDir, "getConstEvent.ts");
  constUnionSource = readFileSync(constUnionPath, "utf8");
  const constUnionGenerated = await import(
    /* @vite-ignore */ `${pathToFileURL(constUnionPath).href}?test=${Date.now()}`
  );
  constUnionOutputSchema = constUnionGenerated.GetConstEventOutput;
});

afterAll(() => {
  for (const outputDir of fixtureOutputDirs) {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

describe("OpenAPI 3.1 const and generated struct typing", () => {
  it("preserves const-discriminated unions in runtime and TypeScript output", () => {
    expect(
      Schema.decodeUnknownSync(constUnionOutputSchema)({
        data: {
          type: "alpha",
          payload: "ok",
          revision: 2,
          enabled: true,
        },
      }),
    ).toEqual({
      data: { type: "alpha", payload: "ok", revision: 2, enabled: true },
    });
    expect(() =>
      Schema.decodeUnknownSync(constUnionOutputSchema)({
        data: {
          type: "gamma",
          payload: "nope",
          revision: 2,
          enabled: true,
        },
      }),
    ).toThrow();

    expect(constUnionSource).toContain('type: "alpha"');
    expect(constUnionSource).toContain('Schema.Literals(["alpha"])');
    expect(constUnionSource).toContain("revision: 2");
    expect(constUnionSource).toContain("Schema.Literals([2])");
    expect(constUnionSource).toContain("enabled: true");
    expect(constUnionSource).toContain("Schema.Literals([true])");
    expect(constUnionSource).toContain('{ mode: "oneOf" }');
  });

  it("exports top-level structs with a compact structural field view", () => {
    expect(constUnionSource).toContain(
      "GeneratedStructCodec<GetConstEventOutput>",
    );
    expect(constUnionSource).toContain(
      "import type { GeneratedStructCodec } from",
    );
  });
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

describe("OpenAPI composed request body generation", () => {
  it("preserves root oneOf body fields", () => {
    const input = {
      id: "membership_123",
      actor_id: "actor_123",
      role_slugs: ["admin", "member"],
      client_secret: "secret_123",
    };
    const decoded = Schema.decodeUnknownSync(updateMembershipInputSchema)(
      input,
    ) as Record<string, unknown>;
    const encoded = Schema.encodeSync(updateMembershipInputSchema)(decoded);

    expect(encoded).toEqual(input);
    expect(updateMembershipSource).toContain("role_slug");
    expect(updateMembershipSource).toContain("role_slugs");
    expect(updateMembershipSource).toContain("role_slug?: string");
    expect(updateMembershipSource).toContain(
      "role_slugs?: ReadonlyArray<string>",
    );
    expect(updateMembershipSource).toContain("actor_id: string");
    expect(updateMembershipSource).toContain(
      "client_secret?: string | Redacted.Redacted<string>",
    );
    expect(updateMembershipSource).toContain(
      "client_secret: Schema.optional(SensitiveString)",
    );
    expect(() =>
      Schema.decodeUnknownSync(updateMembershipInputSchema)({
        id: "membership_123",
        role_slug: "admin",
      }),
    ).toThrow();
  });

  it("preserves allOf common fields and nested oneOf body fields", () => {
    const input = {
      user_id: "user_123",
      organization_id: "organization_123",
      actor_id: "actor_123",
      role_slug: "admin",
    };
    const decoded = Schema.decodeUnknownSync(createMembershipInputSchema)(
      input,
    ) as Record<string, unknown>;
    const encoded = Schema.encodeSync(createMembershipInputSchema)(decoded);

    expect(encoded).toEqual(input);
    expect(createMembershipSource).toContain("user_id: string");
    expect(createMembershipSource).toContain("organization_id: string");
    expect(createMembershipSource).toContain("role_slug");
    expect(createMembershipSource).toContain("role_slugs");
    expect(() =>
      Schema.decodeUnknownSync(createMembershipInputSchema)({
        organization_id: "organization_123",
        actor_id: "actor_123",
        role_slug: "admin",
      }),
    ).toThrow();
  });

  it("serializes composed body fields into the HTTP request body", () => {
    const input = {
      id: "membership_123",
      actor_id: "actor_123",
      role_slugs: ["admin", "member"],
    };
    const parts = T.buildRequestParts(
      updateMembershipInputSchema.ast,
      T.getHttpTrait(updateMembershipInputSchema.ast)!,
      input,
      updateMembershipInputSchema,
    );

    expect(parts.path).toBe("/memberships/membership_123");
    expect(parts.body).toEqual({
      actor_id: "actor_123",
      role_slugs: ["admin", "member"],
    });
  });
});
