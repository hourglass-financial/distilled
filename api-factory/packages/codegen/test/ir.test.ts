import { describe, expect, it } from "vitest";
import {
  canonicalize,
  checkInvariants,
  CodegenError,
  decodeIr,
  dumpIr,
  type ClientIr,
  type FieldIr,
  type OperationIr,
  type SchemaNode,
} from "../src/index.ts";

const stringNode = { kind: "string" } as const;

const field = (
  name: string,
  schema: SchemaNode = stringNode,
  options: Partial<Pick<FieldIr, "optional" | "nullable" | "docs">> = {},
): FieldIr => ({
  name,
  schema,
  optional: options.optional ?? false,
  nullable: options.nullable ?? false,
  ...(options.docs === undefined ? {} : { docs: options.docs }),
});

const operation = (overrides: Partial<OperationIr> = {}): OperationIr => ({
  publicName: { resource: "widgets", method: "get" },
  bindingName: "get",
  exportName: "get",
  inputName: "GetWidgetInput",
  errorsName: "getErrors",
  descriptorName: "getOp",
  opId: "widgets.get",
  httpMethod: "GET",
  retry: "transient",
  pathTemplate: "/widgets/{id}",
  pathParams: ["id"],
  queryParams: [],
  input: { kind: "struct", fields: [field("id")] },
  output: { kind: "named-ref", name: "Widget" },
  errors: ["NotFound"],
  docs: "Fetch a widget.",
  ...overrides,
});

const baseIr = (): ClientIr => ({
  vendor: { slug: "acme", display: "Acme", prefix: "Acme" },
  packageName: "@hourglass-financial/api-factory-acme",
  baseUrl: "https://api.example.test",
  envVars: { apiKey: "ACME_API_KEY", baseUrl: "ACME_API_URL" },
  configErrorMessage: "Acme credentials are not configured.",
  serviceTags: {
    client: "@hourglass-financial/api-factory-acme/AcmeClient",
    credentials: "@hourglass-financial/api-factory-acme/Credentials",
  },
  resources: [
    {
      name: "widgets",
      fileName: "widgets.ts",
      docs: "Widget operations.",
      operations: [operation()],
    },
  ],
  namedSchemas: [
    {
      name: "Widget",
      group: "Widgets",
      docs: "A widget.",
      schema: { kind: "struct", fields: [field("id")] },
    },
  ],
  errors: {
    codeErrors: [],
    coreReexports: ["NotFound"],
  },
  envelope: {
    messageFields: ["message", "error"],
    discriminatorFields: ["code", "error"],
    stringBodyIsMessage: true,
  },
  scaffold: {
    version: "0.0.0",
    private: true,
    repository: {
      type: "git",
      url: "https://github.com/hourglass-financial/distilled",
      directory: "api-factory/clients/acme",
    },
    type: "module",
    sideEffects: false,
    module: "src/index.ts",
    files: ["lib", "src"],
    exports: {
      types: "./lib/index.d.ts",
      bun: "./src/index.ts",
      default: "./lib/index.js",
    },
    scripts: {
      typecheck: "tsc && tsc -p tsconfig.test.json",
      build: "tsc -b",
      fmt: "oxfmt --write src test",
      lint: "oxlint --fix src test",
      check: "bun run typecheck && oxlint src test && oxfmt --check src test",
      test: "bunx vitest run test",
    },
    dependencies: [
      {
        name: "@hourglass-financial/api-factory-core",
        version: "workspace:*",
      },
    ],
    peerDependencies: [{ name: "effect", version: "catalog:" }],
    devDependencies: [
      { name: "@types/bun", version: "catalog:" },
      { name: "@types/node", version: "catalog:" },
      { name: "effect", version: "catalog:" },
      { name: "vitest", version: "catalog:" },
    ],
    tsconfig: {
      extends: "../../tsconfig.base.json",
      include: ["src/**/*.ts"],
      compilerOptions: { outDir: "./lib", rootDir: "./src" },
      references: ["../../packages/core"],
    },
    testTsconfig: {
      extends: "../../tsconfig.base.json",
      include: ["src/**/*.ts", "test/**/*.ts"],
      compilerOptions: {
        rootDir: ".",
        noEmit: true,
        paths: [{ alias: "~/*", targets: ["./src/*"] }],
      },
      references: [],
    },
  },
});

const invariantError = (ir: ClientIr): CodegenError => {
  try {
    checkInvariants(ir);
  } catch (error) {
    expect(error).toBeInstanceOf(CodegenError);
    return error as CodegenError;
  }
  throw new Error("expected checkInvariants to throw");
};

const expectConstruct = (ir: ClientIr, construct: string): CodegenError => {
  const error = invariantError(ir);
  expect(error.message).toContain(construct);
  expect(
    error.violations.some((violation) => violation.construct === construct),
  ).toBe(true);
  return error;
};

describe("checkInvariants", () => {
  it("accepts the canonical minimal IR", () => {
    expect(() => checkInvariants(canonicalize(baseIr()))).not.toThrow();
  });

  it("aggregates duplicate operation, schema, and error-code violations", () => {
    const ir = baseIr();
    const duplicateOp = operation({ bindingName: "getAgain" });
    const duplicateSchema = { ...ir.namedSchemas[0]! };
    const codeErrors = [
      {
        className: "FirstError",
        tag: "FirstError",
        code: "same_code",
        meta: "auth" as const,
        docsStatus: 400,
        docsProse: "First.",
      },
      {
        className: "SecondError",
        tag: "SecondError",
        code: "same_code",
        meta: "auth" as const,
        docsStatus: 400,
        docsProse: "Second.",
      },
    ];
    const error = invariantError({
      ...ir,
      resources: [
        { ...ir.resources[0]!, operations: [operation(), duplicateOp] },
      ],
      namedSchemas: [...ir.namedSchemas, duplicateSchema],
      errors: { ...ir.errors, codeErrors },
    });

    expect(error.violations.length).toBeGreaterThanOrEqual(3);
    expect(error.message).toContain("widgets.get");
    expect(error.message).toContain("Widget");
    expect(error.message).toContain("same_code");
  });

  it("preserves duplicate schemas for fail-closed checking after canonicalization", () => {
    const ir = baseIr();
    const duplicate = { ...ir.namedSchemas[0]! };
    const error = invariantError(
      canonicalize({
        ...ir,
        namedSchemas: [duplicate, ...ir.namedSchemas],
      }),
    );
    expect(error.message).toContain("schema Widget");
  });

  it("rejects a dangling named reference", () => {
    const ir = baseIr();
    expectConstruct(
      {
        ...ir,
        resources: [
          {
            ...ir.resources[0]!,
            operations: [
              operation({ output: { kind: "named-ref", name: "Missing" } }),
            ],
          },
        ],
      },
      "operation widgets.get output",
    );
  });

  it("rejects a forward reference remaining after canonicalization", () => {
    const ir = baseIr();
    const canonical = canonicalize({
      ...ir,
      namedSchemas: [
        {
          name: "Later",
          group: "B",
          docs: "Later.",
          schema: { kind: "struct", fields: [field("id")] },
        },
        {
          name: "Earlier",
          group: "A",
          docs: "Earlier.",
          schema: {
            kind: "struct",
            fields: [field("later", { kind: "named-ref", name: "Later" })],
          },
        },
      ],
    });
    expectConstruct(canonical, "schema Earlier");
  });

  it("rejects a union with one member", () => {
    const ir = baseIr();
    expectConstruct(
      {
        ...ir,
        namedSchemas: [
          {
            ...ir.namedSchemas[0]!,
            schema: {
              kind: "struct",
              fields: [
                field("value", { kind: "union", members: [stringNode] }),
              ],
            },
          },
        ],
      },
      "schema Widget.value",
    );
  });

  it("rejects duplicate union members", () => {
    const ir = baseIr();
    expectConstruct(
      {
        ...ir,
        namedSchemas: [
          {
            ...ir.namedSchemas[0]!,
            schema: {
              kind: "struct",
              fields: [
                field("value", {
                  kind: "union",
                  members: [stringNode, stringNode],
                }),
              ],
            },
          },
        ],
      },
      "schema Widget.value",
    );
  });

  it("rejects pagination paths and parameters that reference absent fields", () => {
    const ir = baseIr();
    expectConstruct(
      {
        ...ir,
        resources: [
          {
            ...ir.resources[0]!,
            operations: [
              operation({
                pagination: {
                  cursorParam: "after",
                  clear: ["before"],
                  nextCursorPath: ["list_metadata", "after"],
                  itemsPath: ["data"],
                  pageSchema: { kind: "named-ref", name: "Widget" },
                  itemSchema: { kind: "named-ref", name: "Widget" },
                },
              }),
            ],
          },
        ],
      },
      "operation widgets.get pagination",
    );
  });

  it("rejects an invalid identifier", () => {
    const ir = baseIr();
    expectConstruct(
      {
        ...ir,
        resources: [
          {
            ...ir.resources[0]!,
            operations: [operation({ bindingName: "not-valid" })],
          },
        ],
      },
      "operation widgets.get bindingName",
    );
  });

  it("requires a reserved-word method to use a distinct binding", () => {
    const ir = baseIr();
    expectConstruct(
      {
        ...ir,
        resources: [
          {
            ...ir.resources[0]!,
            operations: [
              operation({
                publicName: { resource: "widgets", method: "delete" },
                bindingName: "delete",
                exportName: "delete",
                opId: "widgets.delete",
              }),
            ],
          },
        ],
      },
      "operation widgets.delete bindingName",
    );
  });

  it("rejects docs containing a comment terminator", () => {
    const ir = baseIr();
    expectConstruct(
      {
        ...ir,
        namedSchemas: [{ ...ir.namedSchemas[0]!, docs: "bad */ docs" }],
      },
      "schema Widget docs",
    );
  });

  it("rejects constant-body keys colliding with input fields", () => {
    const ir = baseIr();
    expectConstruct(
      {
        ...ir,
        resources: [
          {
            ...ir.resources[0]!,
            operations: [operation({ constantBody: { id: "fixed" } })],
          },
        ],
      },
      "operation widgets.get constantBody.id",
    );
  });

  it("rejects code errors whose code and class-name orders disagree", () => {
    const ir = baseIr();
    expectConstruct(
      {
        ...ir,
        errors: {
          ...ir.errors,
          codeErrors: [
            {
              className: "ZuluError",
              tag: "ZuluError",
              code: "alpha_error",
              meta: "auth",
              docsStatus: 400,
              docsProse: "Alpha.",
            },
            {
              className: "AlphaError",
              tag: "AlphaError",
              code: "zulu_error",
              meta: "auth",
              docsStatus: 400,
              docsProse: "Zulu.",
            },
          ],
        },
      },
      "code-error declarations",
    );
  });
});

describe("canonicalize", () => {
  it("uses UTF-16 code-unit ordering for punctuation, case, and non-ASCII", () => {
    const ir = baseIr();
    const names = ["éclair", "alpha", "_under", "Zulu", "$cash"];
    const canonical = canonicalize({
      ...ir,
      resources: names.map((name) => ({
        name,
        fileName: `${name}.ts`,
        docs: `${name}.`,
        operations: [],
      })),
    });

    expect(canonical.resources.map(({ name }) => name)).toEqual([
      "$cash",
      "Zulu",
      "_under",
      "alpha",
      "éclair",
    ]);
  });

  it("topologically orders schemas with an alphabetical Kahn tie-break", () => {
    const ir = baseIr();
    const canonical = canonicalize({
      ...ir,
      namedSchemas: [
        {
          name: "UsesBeta",
          group: "Same",
          docs: "Uses beta.",
          schema: {
            kind: "struct",
            fields: [field("beta", { kind: "named-ref", name: "Beta" })],
          },
        },
        {
          name: "Beta",
          group: "Same",
          docs: "Beta.",
          schema: { kind: "struct", fields: [] },
        },
        {
          name: "Alpha",
          group: "Same",
          docs: "Alpha.",
          schema: { kind: "struct", fields: [] },
        },
      ],
    });

    expect(canonical.namedSchemas.map(({ name }) => name)).toEqual([
      "Alpha",
      "Beta",
      "UsesBeta",
    ]);
  });

  it("sorts declarations while preserving wire-order collections", () => {
    const ir = baseIr();
    const first = operation({
      publicName: { resource: "widgets", method: "zebra" },
      bindingName: "zebra",
      exportName: "zebra",
      inputName: "ZebraInput",
      errorsName: "zebraErrors",
      descriptorName: "zebraOp",
      opId: "widgets.zebra",
      pathParams: ["second", "first"],
      queryParams: ["z", "a"],
      input: {
        kind: "struct",
        fields: [field("second"), field("first")],
      },
      errors: ["ZuluError", "AlphaError"],
    });
    const second = operation({
      publicName: { resource: "widgets", method: "alpha" },
      bindingName: "alpha",
      exportName: "alpha",
      inputName: "AlphaInput",
      errorsName: "alphaErrors",
      descriptorName: "alphaOp",
      opId: "widgets.alpha",
    });
    const canonical = canonicalize({
      ...ir,
      resources: [{ ...ir.resources[0]!, operations: [first, second] }],
      errors: {
        ...ir.errors,
        codeErrors: [
          {
            className: "ZuluError",
            tag: "ZuluError",
            code: "zulu_error",
            meta: "auth",
            docsStatus: 400,
            docsProse: "Zulu.",
          },
          {
            className: "AlphaError",
            tag: "AlphaError",
            code: "alpha_error",
            meta: "auth",
            docsStatus: 400,
            docsProse: "Alpha.",
          },
        ],
      },
    });

    expect(
      canonical.resources[0]!.operations.map((op) => op.publicName.method),
    ).toEqual(["alpha", "zebra"]);
    const zebra = canonical.resources[0]!.operations[1]!;
    expect(zebra.errors).toEqual(["AlphaError", "ZuluError"]);
    expect(zebra.pathParams).toEqual(["second", "first"]);
    expect(zebra.queryParams).toEqual(["z", "a"]);
    expect(zebra.input.fields.map(({ name }) => name)).toEqual([
      "second",
      "first",
    ]);
    expect(canonical.errors.codeErrors.map(({ code }) => code)).toEqual([
      "alpha_error",
      "zulu_error",
    ]);
  });
});

describe("IR JSON", () => {
  it("rejects an unknown schema-node kind", () => {
    const value = structuredClone(baseIr()) as unknown as {
      resources: Array<{
        operations: Array<{ input: { fields: Array<{ schema: unknown }> } }>;
      }>;
    };
    value.resources[0]!.operations[0]!.input.fields[0]!.schema = {
      kind: "passthrough",
    };
    expect(() => decodeIr(value)).toThrow();
  });

  it("rejects excess properties", () => {
    expect(() => decodeIr({ ...baseIr(), unexpected: true })).toThrow();
  });

  it("round-trips canonical JSON through the fail-closed decoder", () => {
    const ir = baseIr();
    const decoded = decodeIr(JSON.parse(dumpIr(ir)));
    expect(decoded).toEqual(canonicalize(ir));
  });

  it("dumps identical bytes across repeated calls", () => {
    const ir = baseIr();
    expect(dumpIr(ir)).toBe(dumpIr(ir));
    expect(dumpIr(ir).endsWith("\n")).toBe(true);
  });
});
