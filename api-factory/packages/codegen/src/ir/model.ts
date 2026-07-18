import * as Schema from "effect/Schema";
import {
  LiteralValueSchema,
  type NamedRefNode,
  NamedRefNodeSchema,
  type StructNode,
  StructNodeSchema,
  type VoidNode,
  VoidNodeSchema,
  type LiteralValue,
} from "./nodes.ts";

export interface VendorIr {
  readonly slug: string;
  readonly display: string;
  readonly prefix: string;
}

export interface EnvVarsIr {
  readonly apiKey: string;
  readonly baseUrl: string;
}

export interface ServiceTagsIr {
  readonly client: string;
  readonly credentials: string;
}

export interface PublicNameIr {
  readonly resource: string;
  readonly method: string;
}

export type HttpMethodIr = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";
export type RetryIr = "none" | "transient" | "throttling";

export interface PaginationIr {
  readonly cursorParam: string;
  readonly clear: ReadonlyArray<string>;
  readonly nextCursorPath: ReadonlyArray<string>;
  readonly itemsPath: ReadonlyArray<string>;
  readonly pageSchema: NamedRefNode;
  readonly itemSchema: NamedRefNode;
  readonly pagesDocs: string;
  readonly itemsDocs: string;
}

export interface OperationIr {
  readonly publicName: PublicNameIr;
  readonly bindingName: string;
  readonly exportName: string;
  readonly inputName: string;
  readonly errorsName: string;
  readonly descriptorName: string;
  readonly opId: string;
  readonly httpMethod: HttpMethodIr;
  readonly retry: RetryIr;
  readonly pathTemplate: string;
  readonly pathParams: ReadonlyArray<string>;
  readonly queryParams: ReadonlyArray<string>;
  readonly input: StructNode;
  readonly output: NamedRefNode | VoidNode;
  readonly errors: ReadonlyArray<string>;
  readonly errorsDocs?: string | undefined;
  readonly constantBody?: Readonly<Record<string, LiteralValue>> | undefined;
  readonly docs: string;
  readonly pagination?: PaginationIr | undefined;
}

export interface ResourceIr {
  readonly name: string;
  readonly fileName: string;
  readonly docs: string;
  readonly runtimeBannerConcern: string;
  readonly operations: ReadonlyArray<OperationIr>;
}

export interface NamedSchemaIr {
  readonly name: string;
  readonly group: string;
  readonly docs: string;
  readonly schema: StructNode;
}

export type ErrorMetaIr =
  | "auth"
  | "badRequest"
  | "notFound"
  | "conflict"
  | "unprocessable"
  | "throttling"
  | "server"
  | "locked"
  | "quota"
  | "challenge"
  | "config"
  | "parse"
  | "transport"
  | "unknown";

export interface CodeErrorIr {
  readonly className: string;
  readonly tag: string;
  readonly code: string;
  readonly meta: ErrorMetaIr;
  readonly docsStatus: number;
  readonly docsProse: string;
}

export interface ErrorsIr {
  readonly docs?: string | undefined;
  readonly codeErrorsSectionTitle: string;
  readonly codeErrorsDocs?: string | undefined;
  readonly codeErrors: ReadonlyArray<CodeErrorIr>;
  readonly coreReexports: ReadonlyArray<string>;
}

export interface EnvelopeIr {
  readonly decodeDocs: string;
  readonly messageFields: ReadonlyArray<string>;
  readonly discriminatorFields: ReadonlyArray<string>;
  readonly stringBodyIsMessage: boolean;
}

export interface RepositoryIr {
  readonly type: string;
  readonly url: string;
  readonly directory: string;
}

export interface PackageExportsIr {
  readonly types: string;
  readonly bun: string;
  readonly default: string;
}

export interface PackageScriptsIr {
  readonly typecheck: string;
  readonly build: string;
  readonly fmt: string;
  readonly lint: string;
  readonly check: string;
  readonly test: string;
}

export interface DependencyIr {
  readonly name: string;
  readonly version: string;
}

export interface CompilerOptionsIr {
  readonly outDir?: string | undefined;
  readonly rootDir: string;
  readonly noEmit?: boolean | undefined;
  readonly paths?:
    | ReadonlyArray<{
        readonly alias: string;
        readonly targets: ReadonlyArray<string>;
      }>
    | undefined;
}

export interface TsconfigIr {
  readonly extends: string;
  readonly include: ReadonlyArray<string>;
  readonly compilerOptions: CompilerOptionsIr;
  readonly references: ReadonlyArray<string>;
}

export interface ScaffoldIr {
  readonly version: string;
  readonly private: boolean;
  readonly repository: RepositoryIr;
  readonly type: string;
  readonly sideEffects: boolean;
  readonly module: string;
  readonly files: ReadonlyArray<string>;
  readonly exports: PackageExportsIr;
  readonly scripts: PackageScriptsIr;
  readonly dependencies: ReadonlyArray<DependencyIr>;
  readonly peerDependencies: ReadonlyArray<DependencyIr>;
  readonly devDependencies: ReadonlyArray<DependencyIr>;
  readonly tsconfig: TsconfigIr;
  readonly testTsconfig: TsconfigIr;
}

export interface ClientIr {
  readonly vendor: VendorIr;
  readonly packageName: string;
  readonly baseUrl: string;
  readonly envVars: EnvVarsIr;
  readonly configErrorMessage: string;
  readonly serviceTags: ServiceTagsIr;
  readonly resources: ReadonlyArray<ResourceIr>;
  readonly namedSchemas: ReadonlyArray<NamedSchemaIr>;
  readonly errors: ErrorsIr;
  readonly envelope: EnvelopeIr;
  readonly behavioralCoverageLocation: string;
  readonly scaffold: ScaffoldIr;
}

const DependencyIrSchema = Schema.Struct({
  name: Schema.String,
  version: Schema.String,
});

const TsconfigIrSchema = Schema.Struct({
  extends: Schema.String,
  include: Schema.Array(Schema.String),
  compilerOptions: Schema.Struct({
    outDir: Schema.optional(Schema.String),
    rootDir: Schema.String,
    noEmit: Schema.optional(Schema.Boolean),
    paths: Schema.optional(
      Schema.Array(
        Schema.Struct({
          alias: Schema.String,
          targets: Schema.Array(Schema.String),
        }),
      ),
    ),
  }),
  references: Schema.Array(Schema.String),
});

export const ClientIrSchema: Schema.Codec<ClientIr> = Schema.Struct({
  vendor: Schema.Struct({
    slug: Schema.String,
    display: Schema.String,
    prefix: Schema.String,
  }),
  packageName: Schema.String,
  baseUrl: Schema.String,
  envVars: Schema.Struct({ apiKey: Schema.String, baseUrl: Schema.String }),
  configErrorMessage: Schema.String,
  serviceTags: Schema.Struct({
    client: Schema.String,
    credentials: Schema.String,
  }),
  resources: Schema.Array(
    Schema.Struct({
      name: Schema.String,
      fileName: Schema.String,
      docs: Schema.String,
      runtimeBannerConcern: Schema.String,
      operations: Schema.Array(
        Schema.Struct({
          publicName: Schema.Struct({
            resource: Schema.String,
            method: Schema.String,
          }),
          bindingName: Schema.String,
          exportName: Schema.String,
          inputName: Schema.String,
          errorsName: Schema.String,
          descriptorName: Schema.String,
          opId: Schema.String,
          httpMethod: Schema.Literals([
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "HEAD",
          ]),
          retry: Schema.Literals(["none", "transient", "throttling"]),
          pathTemplate: Schema.String,
          pathParams: Schema.Array(Schema.String),
          queryParams: Schema.Array(Schema.String),
          input: StructNodeSchema,
          output: Schema.Union([NamedRefNodeSchema, VoidNodeSchema]),
          errors: Schema.Array(Schema.String),
          errorsDocs: Schema.optional(Schema.String),
          constantBody: Schema.optional(
            Schema.Record(Schema.String, LiteralValueSchema),
          ),
          docs: Schema.String,
          pagination: Schema.optional(
            Schema.Struct({
              cursorParam: Schema.String,
              clear: Schema.Array(Schema.String),
              nextCursorPath: Schema.Array(Schema.String),
              itemsPath: Schema.Array(Schema.String),
              pageSchema: NamedRefNodeSchema,
              itemSchema: NamedRefNodeSchema,
              pagesDocs: Schema.String,
              itemsDocs: Schema.String,
            }),
          ),
        }),
      ),
    }),
  ),
  namedSchemas: Schema.Array(
    Schema.Struct({
      name: Schema.String,
      group: Schema.String,
      docs: Schema.String,
      schema: StructNodeSchema,
    }),
  ),
  errors: Schema.Struct({
    docs: Schema.optional(Schema.String),
    codeErrorsSectionTitle: Schema.String,
    codeErrorsDocs: Schema.optional(Schema.String),
    codeErrors: Schema.Array(
      Schema.Struct({
        className: Schema.String,
        tag: Schema.String,
        code: Schema.String,
        meta: Schema.Literals([
          "auth",
          "badRequest",
          "notFound",
          "conflict",
          "unprocessable",
          "throttling",
          "server",
          "locked",
          "quota",
          "challenge",
          "config",
          "parse",
          "transport",
          "unknown",
        ]),
        docsStatus: Schema.Number,
        docsProse: Schema.String,
      }),
    ),
    coreReexports: Schema.Array(Schema.String),
  }),
  envelope: Schema.Struct({
    decodeDocs: Schema.String,
    messageFields: Schema.Array(Schema.String),
    discriminatorFields: Schema.Array(Schema.String),
    stringBodyIsMessage: Schema.Boolean,
  }),
  behavioralCoverageLocation: Schema.String,
  scaffold: Schema.Struct({
    version: Schema.String,
    private: Schema.Boolean,
    repository: Schema.Struct({
      type: Schema.String,
      url: Schema.String,
      directory: Schema.String,
    }),
    type: Schema.String,
    sideEffects: Schema.Boolean,
    module: Schema.String,
    files: Schema.Array(Schema.String),
    exports: Schema.Struct({
      types: Schema.String,
      bun: Schema.String,
      default: Schema.String,
    }),
    scripts: Schema.Struct({
      typecheck: Schema.String,
      build: Schema.String,
      fmt: Schema.String,
      lint: Schema.String,
      check: Schema.String,
      test: Schema.String,
    }),
    dependencies: Schema.Array(DependencyIrSchema),
    peerDependencies: Schema.Array(DependencyIrSchema),
    devDependencies: Schema.Array(DependencyIrSchema),
    tsconfig: TsconfigIrSchema,
    testTsconfig: TsconfigIrSchema,
  }),
});
