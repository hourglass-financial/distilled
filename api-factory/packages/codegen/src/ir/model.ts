import {
  type Category,
  type HttpMethod,
  Meta,
} from "@hourglass-financial/api-factory-core";
import * as Schema from "effect/Schema";
import {
  LiteralValueSchema,
  NamedRefNodeSchema,
  StructNodeSchema,
  VoidNodeSchema,
} from "./nodes.ts";

type _Assert<T extends true> = T;
type _Equal<Left, Right> = [Left] extends [Right]
  ? [Right] extends [Left]
    ? true
    : false
  : false;

const httpMethods = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
] as const satisfies ReadonlyArray<HttpMethod>;
type _HttpMethodsAreExhaustive = _Assert<
  _Equal<(typeof httpMethods)[number], HttpMethod>
>;

type RetryDisposition = Category.RetryDisposition;
const retryDispositions = [
  "none",
  "transient",
  "throttling",
] as const satisfies ReadonlyArray<RetryDisposition>;
type _RetryDispositionsAreExhaustive = _Assert<
  _Equal<(typeof retryDispositions)[number], RetryDisposition>
>;

const metaNames = Object.keys(Meta).sort() as ReadonlyArray<keyof typeof Meta>;

const VendorIrSchema = Schema.Struct({
  slug: Schema.String,
  display: Schema.String,
  prefix: Schema.String,
});

export interface VendorIr extends Schema.Schema.Type<typeof VendorIrSchema> {}

const EnvVarsIrSchema = Schema.Struct({
  apiKey: Schema.String,
  baseUrl: Schema.String,
});

export interface EnvVarsIr extends Schema.Schema.Type<typeof EnvVarsIrSchema> {}

const ServiceTagsIrSchema = Schema.Struct({
  client: Schema.String,
  credentials: Schema.String,
});

export interface ServiceTagsIr extends Schema.Schema.Type<
  typeof ServiceTagsIrSchema
> {}

const PublicNameIrSchema = Schema.Struct({
  resource: Schema.String,
  method: Schema.String,
});

export interface PublicNameIr extends Schema.Schema.Type<
  typeof PublicNameIrSchema
> {}

export type HttpMethodIr = HttpMethod;
export type RetryIr = RetryDisposition;

const PaginationIrSchema = Schema.Struct({
  cursorParam: Schema.String,
  clear: Schema.Array(Schema.String),
  nextCursorPath: Schema.Array(Schema.String),
  itemsPath: Schema.Array(Schema.String),
  pageSchema: NamedRefNodeSchema,
  itemSchema: NamedRefNodeSchema,
  pagesDocs: Schema.String,
  itemsDocs: Schema.String,
});

export interface PaginationIr extends Schema.Schema.Type<
  typeof PaginationIrSchema
> {}

const OperationIrSchema = Schema.Struct({
  publicName: PublicNameIrSchema,
  bindingName: Schema.String,
  exportName: Schema.String,
  inputName: Schema.String,
  errorsName: Schema.String,
  descriptorName: Schema.String,
  opId: Schema.String,
  httpMethod: Schema.Literals(httpMethods),
  retry: Schema.Literals(retryDispositions),
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
  pagination: Schema.optional(PaginationIrSchema),
});

export interface OperationIr extends Schema.Schema.Type<
  typeof OperationIrSchema
> {}

const ResourceIrSchema = Schema.Struct({
  name: Schema.String,
  fileName: Schema.String,
  docs: Schema.String,
  runtimeBannerConcern: Schema.String,
  operations: Schema.Array(OperationIrSchema),
});

export interface ResourceIr extends Schema.Schema.Type<
  typeof ResourceIrSchema
> {}

const NamedSchemaIrSchema = Schema.Struct({
  name: Schema.String,
  group: Schema.String,
  docs: Schema.String,
  schema: StructNodeSchema,
});

export interface NamedSchemaIr extends Schema.Schema.Type<
  typeof NamedSchemaIrSchema
> {}

export type ErrorMetaIr = keyof typeof Meta;

const CodeErrorIrSchema = Schema.Struct({
  className: Schema.String,
  tag: Schema.String,
  code: Schema.String,
  meta: Schema.Literals(metaNames),
  docsStatus: Schema.Number,
  docsProse: Schema.String,
});

export interface CodeErrorIr extends Schema.Schema.Type<
  typeof CodeErrorIrSchema
> {}

export const coreReexportNames = [
  "BadRequest",
  "Unauthorized",
  "Forbidden",
  "NotFound",
  "Conflict",
  "UnprocessableEntity",
  "Locked",
  "TooManyRequests",
  "InternalServerError",
  "BadGateway",
  "ServiceUnavailable",
  "GatewayTimeout",
  "ConfigError",
] as const;

export type CoreReexportIr = (typeof coreReexportNames)[number];

const ErrorsIrSchema = Schema.Struct({
  docs: Schema.optional(Schema.String),
  codeErrorsSectionTitle: Schema.String,
  codeErrorsDocs: Schema.optional(Schema.String),
  codeErrors: Schema.Array(CodeErrorIrSchema),
  coreReexports: Schema.Array(Schema.Literals(coreReexportNames)),
});

export interface ErrorsIr extends Schema.Schema.Type<typeof ErrorsIrSchema> {}

const EnvelopeIrSchema = Schema.Struct({
  decodeDocs: Schema.String,
  messageFields: Schema.Array(Schema.String),
  discriminatorFields: Schema.Array(Schema.String),
  stringBodyIsMessage: Schema.Boolean,
});

export interface EnvelopeIr extends Schema.Schema.Type<
  typeof EnvelopeIrSchema
> {}

const RepositoryIrSchema = Schema.Struct({
  type: Schema.String,
  url: Schema.String,
  directory: Schema.String,
});

export interface RepositoryIr extends Schema.Schema.Type<
  typeof RepositoryIrSchema
> {}

const PackageExportsIrSchema = Schema.Struct({
  types: Schema.String,
  bun: Schema.String,
  default: Schema.String,
});

export interface PackageExportsIr extends Schema.Schema.Type<
  typeof PackageExportsIrSchema
> {}

const PackageScriptsIrSchema = Schema.Struct({
  typecheck: Schema.String,
  build: Schema.String,
  fmt: Schema.String,
  lint: Schema.String,
  check: Schema.String,
  test: Schema.String,
});

export interface PackageScriptsIr extends Schema.Schema.Type<
  typeof PackageScriptsIrSchema
> {}

const DependencyIrSchema = Schema.Struct({
  name: Schema.String,
  version: Schema.String,
});

export interface DependencyIr extends Schema.Schema.Type<
  typeof DependencyIrSchema
> {}

const CompilerPathIrSchema = Schema.Struct({
  alias: Schema.String,
  targets: Schema.Array(Schema.String),
});

const CompilerOptionsIrSchema = Schema.Struct({
  outDir: Schema.optional(Schema.String),
  rootDir: Schema.String,
  noEmit: Schema.optional(Schema.Boolean),
  paths: Schema.optional(Schema.Array(CompilerPathIrSchema)),
});

export interface CompilerOptionsIr extends Schema.Schema.Type<
  typeof CompilerOptionsIrSchema
> {}

const TsconfigIrSchema = Schema.Struct({
  extends: Schema.String,
  include: Schema.Array(Schema.String),
  compilerOptions: CompilerOptionsIrSchema,
  references: Schema.Array(Schema.String),
});

export interface TsconfigIr extends Schema.Schema.Type<
  typeof TsconfigIrSchema
> {}

const ScaffoldIrSchema = Schema.Struct({
  version: Schema.String,
  private: Schema.Boolean,
  repository: RepositoryIrSchema,
  type: Schema.String,
  sideEffects: Schema.Boolean,
  module: Schema.String,
  files: Schema.Array(Schema.String),
  exports: PackageExportsIrSchema,
  scripts: PackageScriptsIrSchema,
  dependencies: Schema.Array(DependencyIrSchema),
  peerDependencies: Schema.Array(DependencyIrSchema),
  devDependencies: Schema.Array(DependencyIrSchema),
  tsconfig: TsconfigIrSchema,
  testTsconfig: TsconfigIrSchema,
});

export interface ScaffoldIr extends Schema.Schema.Type<
  typeof ScaffoldIrSchema
> {}

export const ClientIrSchema = Schema.Struct({
  vendor: VendorIrSchema,
  packageName: Schema.String,
  baseUrl: Schema.String,
  envVars: EnvVarsIrSchema,
  configErrorMessage: Schema.String,
  serviceTags: ServiceTagsIrSchema,
  resources: Schema.Array(ResourceIrSchema),
  namedSchemas: Schema.Array(NamedSchemaIrSchema),
  errors: ErrorsIrSchema,
  envelope: EnvelopeIrSchema,
  behavioralCoverageLocation: Schema.String,
  scaffold: ScaffoldIrSchema,
});

export interface ClientIr extends Schema.Schema.Type<typeof ClientIrSchema> {}
