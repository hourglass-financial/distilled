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
      runtimeBannerConcern: "request execution, retry, pagination",
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
    codeErrorsSectionTitle: "Code-discriminated errors",
    codeErrors: [],
    coreReexports: ["NotFound"],
  },
  envelope: {
    decodeDocs: "Normalize Acme error envelopes.",
    messageFields: ["message", "error"],
    discriminatorFields: ["code", "error"],
    stringBodyIsMessage: true,
  },
  behavioralCoverageLocation: "vendors/acme",
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

const paginatedIr = (): ClientIr => {
  const ir = baseIr();
  return {
    ...ir,
    resources: [
      {
        ...ir.resources[0]!,
        operations: [
          operation({
            input: {
              kind: "struct",
              fields: [
                field("id"),
                field("after", stringNode, { optional: true }),
              ],
            },
            output: { kind: "named-ref", name: "WidgetPage" },
            pagination: {
              cursorParam: "after",
              clear: [],
              nextCursorPath: ["next"],
              itemsPath: ["items"],
              pageSchema: { kind: "named-ref", name: "WidgetPage" },
              itemSchema: { kind: "named-ref", name: "Widget" },
              pagesDocs: "Stream every page of widgets.",
              itemsDocs: "Stream every widget.",
            },
          }),
        ],
      },
    ],
    namedSchemas: [
      ...ir.namedSchemas,
      {
        name: "WidgetPage",
        group: "Widgets",
        docs: "A page of widgets.",
        schema: {
          kind: "struct",
          fields: [
            field("next", stringNode, { optional: true, nullable: true }),
            field("items", {
              kind: "array",
              item: { kind: "named-ref", name: "Widget" },
            }),
          ],
        },
      },
    ],
  };
};

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
                  pagesDocs: "Stream every page of widgets.",
                  itemsDocs: "Stream every widget across every page.",
                },
              }),
            ],
          },
        ],
      },
      "operation widgets.get pagination",
    );
  });

  it("rejects pagination on an array output", () => {
    const ir = paginatedIr();
    const arrayOutput: OperationIr["output"] = {
      kind: "array",
      item: { kind: "named-ref", name: "Widget" },
    };
    const error = invariantError({
      ...ir,
      resources: [
        {
          ...ir.resources[0]!,
          operations: [
            operation({
              ...ir.resources[0]!.operations[0]!,
              output: arrayOutput,
            }),
          ],
        },
      ],
    });

    expect(error.violations).toContainEqual(
      expect.objectContaining({
        rule: "pagination.output",
        message:
          "array output cannot be paginated; cursor pagination requires a struct envelope",
      }),
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

  it("rejects resolved envelope docs containing a comment terminator", () => {
    const ir = baseIr();
    expectConstruct(
      {
        ...ir,
        envelope: { ...ir.envelope, decodeDocs: "bad */ docs" },
      },
      "envelope decode docs",
    );
  });

  it("rejects a vendor display containing a comment terminator", () => {
    const ir = baseIr();
    expectConstruct(
      { ...ir, vendor: { ...ir.vendor, display: "Acme */ injected" } },
      "vendor display",
    );
  });

  it("rejects a package name containing a comment terminator", () => {
    const ir = baseIr();
    expectConstruct(
      { ...ir, packageName: "@acme/sdk */ injected" },
      "packageName",
    );
  });

  it.each(["apiKey", "baseUrl"] as const)(
    "rejects envVars.%s containing a comment terminator",
    (name) => {
      const ir = baseIr();
      expectConstruct(
        {
          ...ir,
          envVars: { ...ir.envVars, [name]: "ACME */ injected" },
        },
        `envVars.${name}`,
      );
    },
  );

  it("rejects a runtime banner concern containing a comment terminator", () => {
    const ir = baseIr();
    expectConstruct(
      {
        ...ir,
        resources: [
          {
            ...ir.resources[0]!,
            runtimeBannerConcern: "request execution */ injected",
          },
        ],
      },
      "resource widgets runtimeBannerConcern",
    );
  });

  it("rejects a path template containing a newline", () => {
    const ir = baseIr();
    expectConstruct(
      {
        ...ir,
        resources: [
          {
            ...ir.resources[0]!,
            operations: [
              operation({ pathTemplate: "/widgets/{id}\n// injected" }),
            ],
          },
        ],
      },
      "operation widgets.get pathTemplate",
    );
  });

  it("rejects an error code containing a comment terminator", () => {
    const ir = baseIr();
    expectConstruct(
      {
        ...ir,
        errors: {
          ...ir.errors,
          codeErrors: [
            {
              className: "InjectedError",
              tag: "InjectedError",
              code: "bad */ code",
              meta: "badRequest",
              docsStatus: 400,
              docsProse: "Bad input.",
            },
          ],
        },
      },
      "error InjectedError code",
    );
  });

  it("rejects a code-error section title containing a newline", () => {
    const ir = baseIr();
    expectConstruct(
      {
        ...ir,
        errors: {
          ...ir.errors,
          codeErrorsSectionTitle: "Code errors\nInjected section",
        },
      },
      "code errors section title",
    );
  });

  it("rejects an unsafe schema section title", () => {
    const ir = baseIr();
    const error = expectConstruct(
      {
        ...ir,
        namedSchemas: [
          { ...ir.namedSchemas[0]!, group: "Widgets */\nInjected section" },
        ],
      },
      "schema Widget group",
    );
    expect(error.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rule: "docs.comment-terminator" }),
        expect.objectContaining({ rule: "comment.single-line" }),
      ]),
    );
  });

  it("rejects a resource with no operations", () => {
    const ir = baseIr();
    expectConstruct(
      {
        ...ir,
        resources: [{ ...ir.resources[0]!, operations: [] }],
      },
      "resource widgets",
    );
  });

  it("rejects schema names reserved by the emitter", () => {
    const ir = baseIr();
    expectConstruct(
      {
        ...ir,
        resources: [
          {
            ...ir.resources[0]!,
            operations: [
              operation({ output: { kind: "named-ref", name: "Schema" } }),
            ],
          },
        ],
        namedSchemas: [{ ...ir.namedSchemas[0]!, name: "Schema" }],
      },
      "schema Schema name",
    );
  });

  it("rejects non-string record keys", () => {
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
                field("metadata", {
                  kind: "record",
                  key: { kind: "array", item: stringNode },
                  value: stringNode,
                }),
              ],
            },
          },
        ],
      },
      "schema Widget.metadata key",
    );
  });

  it("rejects a pagination items path that does not resolve to an array", () => {
    const ir = paginatedIr();
    expectConstruct(
      {
        ...ir,
        namedSchemas: ir.namedSchemas.map((schema) =>
          schema.name === "WidgetPage"
            ? {
                ...schema,
                schema: {
                  ...schema.schema,
                  fields: schema.schema.fields.map((entry) =>
                    entry.name === "items"
                      ? { ...entry, schema: stringNode }
                      : entry,
                  ),
                },
              }
            : schema,
        ),
      },
      "operation widgets.get pagination itemsPath items",
    );
  });

  it("rejects a pagination cursor path that does not resolve to a string", () => {
    const ir = paginatedIr();
    expectConstruct(
      {
        ...ir,
        namedSchemas: ir.namedSchemas.map((schema) =>
          schema.name === "WidgetPage"
            ? {
                ...schema,
                schema: {
                  ...schema.schema,
                  fields: schema.schema.fields.map((entry) =>
                    entry.name === "next"
                      ? { ...entry, schema: { kind: "number" } }
                      : entry,
                  ),
                },
              }
            : schema,
        ),
      },
      "operation widgets.get pagination nextCursorPath next",
    );
  });

  it("rejects a path placeholder missing from pathParams", () => {
    const ir = baseIr();
    expectConstruct(
      {
        ...ir,
        resources: [
          {
            ...ir.resources[0]!,
            operations: [
              operation({
                pathTemplate: "/widgets/{id}/{slug}",
                input: { kind: "struct", fields: [field("id"), field("slug")] },
              }),
            ],
          },
        ],
      },
      "operation widgets.get pathTemplate placeholder slug",
    );
  });

  it("rejects a pathParam absent from the path template", () => {
    const ir = baseIr();
    expectConstruct(
      {
        ...ir,
        resources: [
          {
            ...ir.resources[0]!,
            operations: [
              operation({
                pathParams: ["id", "extra"],
                input: {
                  kind: "struct",
                  fields: [field("id"), field("extra")],
                },
              }),
            ],
          },
        ],
      },
      "operation widgets.get pathParams.extra",
    );
  });

  it("rejects a duplicate path placeholder", () => {
    const ir = baseIr();
    expectConstruct(
      {
        ...ir,
        resources: [
          {
            ...ir.resources[0]!,
            operations: [operation({ pathTemplate: "/widgets/{id}/{id}" })],
          },
        ],
      },
      "operation widgets.get pathTemplate placeholder id",
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

  it("rejects resources whose name and fileName orders disagree", () => {
    const ir = baseIr();
    expectConstruct(
      {
        ...ir,
        resources: [
          {
            name: "alpha",
            fileName: "zulu.ts",
            docs: "Alpha operations.",
            runtimeBannerConcern: "request execution",
            operations: [],
          },
          {
            name: "zulu",
            fileName: "alpha.ts",
            docs: "Zulu operations.",
            runtimeBannerConcern: "request execution",
            operations: [],
          },
        ],
      },
      "resource declarations",
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
        runtimeBannerConcern: "request execution",
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
  it("round-trips an array output whose item is a named reference", () => {
    const value = structuredClone(baseIr()) as unknown as {
      resources: Array<{
        operations: Array<{ output: unknown }>;
      }>;
    };
    value.resources[0]!.operations[0]!.output = {
      kind: "array",
      item: { kind: "named-ref", name: "Widget" },
    };

    expect(decodeIr(JSON.parse(dumpIr(decodeIr(value))))).toEqual(value);
  });

  it.each([
    ["primitive", { kind: "string" }],
    [
      "nested array",
      { kind: "array", item: { kind: "named-ref", name: "Widget" } },
    ],
  ])("rejects an array output with a %s item", (_name, item) => {
    const value = structuredClone(baseIr()) as unknown as {
      resources: Array<{
        operations: Array<{ output: unknown }>;
      }>;
    };
    value.resources[0]!.operations[0]!.output = { kind: "array", item };

    expect(() => decodeIr(value)).toThrow(CodegenError);
  });

  it.each([
    ["property leaf", { kind: "json" }],
    ["array item", { kind: "array", item: { kind: "json" } }],
    [
      "union member",
      {
        kind: "union",
        members: [{ kind: "string" }, { kind: "json" }],
      },
    ],
  ])("rejects json in %s position during decode", (_position, schema) => {
    const value = structuredClone(baseIr()) as unknown as {
      namedSchemas: Array<{
        schema: { fields: Array<{ schema: unknown }> };
      }>;
    };
    value.namedSchemas[0]!.schema.fields[0]!.schema = schema;
    try {
      decodeIr(value);
      throw new Error("expected decodeIr to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(CodegenError);
      expect((error as CodegenError).violations).toEqual([
        expect.objectContaining({ rule: "json.record-value-only" }),
      ]);
    }
  });

  it("rejects an unknown schema-node kind", () => {
    const value = structuredClone(baseIr()) as unknown as {
      resources: Array<{
        operations: Array<{ input: { fields: Array<{ schema: unknown }> } }>;
      }>;
    };
    value.resources[0]!.operations[0]!.input.fields[0]!.schema = {
      kind: "passthrough",
    };
    try {
      decodeIr(value);
      throw new Error("expected decodeIr to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(CodegenError);
      expect((error as CodegenError).violations).toEqual([
        expect.objectContaining({ rule: "ir.decode" }),
      ]);
    }
  });

  it("rejects excess properties", () => {
    try {
      decodeIr({ ...baseIr(), unexpected: true });
      throw new Error("expected decodeIr to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(CodegenError);
      expect((error as CodegenError).violations).toEqual([
        expect.objectContaining({ rule: "ir.decode" }),
      ]);
    }
  });

  it("rejects a core re-export outside the closed vocabulary", () => {
    const value = structuredClone(baseIr()) as unknown as {
      errors: { coreReexports: Array<string> };
    };
    value.errors.coreReexports = ["ImaginaryCoreError"];
    try {
      decodeIr(value);
      throw new Error("expected decodeIr to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(CodegenError);
      expect((error as CodegenError).violations).toEqual([
        expect.objectContaining({ rule: "ir.decode" }),
      ]);
    }
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
