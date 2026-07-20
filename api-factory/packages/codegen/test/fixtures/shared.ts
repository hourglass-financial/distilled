import type {
  ClientIr,
  FieldIr,
  NamedSchemaIr,
  OperationIr,
  ResourceIr,
  SchemaNode,
} from "../../src/index.ts";

export const field = (
  name: string,
  schema: SchemaNode = { kind: "string" },
  options: Partial<Pick<FieldIr, "optional" | "nullable" | "docs">> = {},
): FieldIr => ({
  name,
  schema,
  optional: options.optional ?? false,
  nullable: options.nullable ?? false,
  ...(options.docs === undefined ? {} : { docs: options.docs }),
});

export const operation = (
  resource: string,
  method: string,
  inputName: string,
  output: OperationIr["output"],
  overrides: Partial<OperationIr> = {},
): OperationIr => ({
  publicName: { resource, method },
  bindingName: method,
  exportName: method,
  inputName,
  errorsName: `${method}Errors`,
  descriptorName: `${method}Op`,
  opId: `${resource}.${method}`,
  httpMethod: "GET",
  retry: "transient",
  pathTemplate: `/${resource}`,
  pathParams: [],
  queryParams: [],
  input: { kind: "struct", fields: [] },
  output,
  errors: ["NotFound"],
  docs: `${method} ${resource}.`,
  ...overrides,
});

interface FixtureOptions {
  readonly slug: string;
  readonly display: string;
  readonly prefix: string;
  readonly resources: ReadonlyArray<ResourceIr>;
  readonly namedSchemas: ReadonlyArray<NamedSchemaIr>;
  readonly errors?: ClientIr["errors"];
}

export const fixture = (options: FixtureOptions): ClientIr => {
  const packageName = `@hourglass-financial/api-factory-${options.slug}`;
  return {
    vendor: {
      slug: options.slug,
      display: options.display,
      prefix: options.prefix,
    },
    packageName,
    baseUrl: `https://api.${options.slug}.example`,
    envVars: {
      apiKey: `${options.slug.replaceAll("-", "_").toUpperCase()}_API_KEY`,
      baseUrl: `${options.slug.replaceAll("-", "_").toUpperCase()}_API_URL`,
    },
    configErrorMessage: `${options.display} credentials are not configured.`,
    serviceTags: {
      client: `${packageName}/${options.prefix}Client`,
      credentials: `${packageName}/Credentials`,
    },
    resources: options.resources,
    namedSchemas: options.namedSchemas,
    errors: options.errors ?? {
      codeErrorsSectionTitle: "Code-discriminated errors",
      codeErrors: [],
      coreReexports: ["NotFound"],
    },
    envelope: {
      decodeDocs: `Normalize ${options.display}'s two error envelopes into one shape. \`code\` and the\nOAuth-style \`error\` collapse to a single discriminator; \`message\` prefers the\nhuman field of whichever envelope is present.`,
      messageFields: ["message", "error_description", "error"],
      discriminatorFields: ["code", "error"],
      stringBodyIsMessage: true,
    },
    behavioralCoverageLocation: `vendors/${options.slug}`,
    scaffold: {
      version: "0.0.0",
      private: true,
      repository: {
        type: "git",
        url: "https://github.com/hourglass-financial/distilled",
        directory: `api-factory/clients/${options.slug}`,
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
  };
};

export const resourceDocs =
  "Uniform per-operation blocks: input schema + type, a declarative descriptor,\nand a thin exported function that dispatches through `run`.";
