import { type HttpMethod, Meta } from "@hourglass-financial/api-factory-core";
import * as Schema from "effect/Schema";

/**
 * The vendor config schema — the engine-defined contract for
 * `vendors/<vendor>/config.json` (#31 §5). Pure declarative data: every field
 * is a selection of an engine capability on a closed axis. There are no hooks
 * and no vendor-supplied code; a quirk this schema cannot express forces a
 * reviewed engine capability, never a vendor-side extension. Decoding is
 * fail-closed (`errors: "all"`, `onExcessProperty: "error"`), so a stray or
 * misspelled key is a hard error naming the path.
 */

const retryDispositions = ["none", "throttling", "transient"] as const;

const metaNames = Object.keys(Meta).sort() as ReadonlyArray<keyof typeof Meta>;

const RetryDispositionSchema = Schema.Literals(retryDispositions);

const VendorIdentitySchema = Schema.Struct({
  slug: Schema.String,
  display: Schema.String,
  prefix: Schema.String,
});

/** The only supported auth capability today; new schemes are engine changes. */
const AuthConfigSchema = Schema.Struct({
  scheme: Schema.Literal("bearer"),
});

const httpMethods = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
] as const satisfies ReadonlyArray<HttpMethod>;

/** Complete method → retry-disposition map. Explicit for all six methods. */
const RetryConfigSchema = Schema.Struct({
  GET: RetryDispositionSchema,
  POST: RetryDispositionSchema,
  PUT: RetryDispositionSchema,
  PATCH: RetryDispositionSchema,
  DELETE: RetryDispositionSchema,
  HEAD: RetryDispositionSchema,
});

const EnvelopeConfigSchema = Schema.Struct({
  messageFields: Schema.Array(Schema.String),
  discriminatorFields: Schema.Array(Schema.String),
  stringBodyIsMessage: Schema.Boolean,
  decodeDocs: Schema.optional(Schema.String),
});

const PaginationConfigSchema = Schema.Union([
  Schema.Struct({ mode: Schema.Literal("none") }),
  Schema.Struct({
    mode: Schema.Literal("cursor"),
    cursorParam: Schema.String,
    clearParams: Schema.Array(Schema.String),
    nextCursorPath: Schema.Array(Schema.String),
    itemsPath: Schema.Array(Schema.String),
  }),
]);

/**
 * Error-surface axes. `codeMeta` assigns every lifted discriminator code a
 * member of core's closed `Meta` vocabulary (ADR-0005) — an unknown meta name
 * fails the decode, and a lifted code with no assignment fails normalization.
 * `codeClassNames` overrides the derived public class and tag name for a code.
 */
const ErrorsConfigSchema = Schema.Struct({
  coreReexports: Schema.Literals(["all", "referenced"]),
  codeMeta: Schema.Record(Schema.String, Schema.Literals(metaNames)),
  codeClassNames: Schema.optional(Schema.Record(Schema.String, Schema.String)),
  codeProse: Schema.optional(Schema.Record(Schema.String, Schema.String)),
  sectionTitle: Schema.optional(Schema.String),
  docs: Schema.optional(Schema.String),
  codeDocs: Schema.optional(Schema.String),
});

/**
 * Fail-closed naming overrides (#31 §7), keyed by spec operationId. A
 * derivation collision or an underivable name hard-errors and demands an
 * entry here; an entry naming an operationId absent from the spec is itself
 * a hard error, so overrides can never silently rot.
 */
const OperationNamingOverrideSchema = Schema.Struct({
  resource: Schema.optional(Schema.String),
  method: Schema.optional(Schema.String),
  inputName: Schema.optional(Schema.String),
  errorsName: Schema.optional(Schema.String),
  descriptorName: Schema.optional(Schema.String),
  bindingName: Schema.optional(Schema.String),
});

const NamingConfigSchema = Schema.Struct({
  resources: Schema.optional(Schema.Record(Schema.String, Schema.String)),
  schemas: Schema.optional(Schema.Record(Schema.String, Schema.String)),
  operations: Schema.optional(
    Schema.Record(Schema.String, OperationNamingOverrideSchema),
  ),
});

/** Prose overrides for a derived resource, keyed by resolved resource name. */
const ResourceOverrideSchema = Schema.Struct({
  docs: Schema.optional(Schema.String),
  runtimeBannerConcern: Schema.optional(Schema.String),
});

/** Prose overrides for one operation, keyed by qualified `resource.method`. */
const OperationOverrideSchema = Schema.Struct({
  docs: Schema.optional(Schema.String),
  errorsDocs: Schema.optional(Schema.String),
});

/** Prose override for one emitted named schema, keyed by its public name. */
const SchemaOverrideSchema = Schema.Struct({
  docs: Schema.String,
});

export const VendorConfigSchema = Schema.Struct({
  vendor: VendorIdentitySchema,
  baseUrl: Schema.String,
  auth: AuthConfigSchema,
  retry: RetryConfigSchema,
  envelope: EnvelopeConfigSchema,
  pagination: PaginationConfigSchema,
  errors: ErrorsConfigSchema,
  naming: Schema.optional(NamingConfigSchema),
  resources: Schema.optional(
    Schema.Record(Schema.String, ResourceOverrideSchema),
  ),
  schemas: Schema.optional(Schema.Record(Schema.String, SchemaOverrideSchema)),
  operations: Schema.optional(
    Schema.Record(Schema.String, OperationOverrideSchema),
  ),
  packageVersion: Schema.optional(Schema.String),
});

export interface VendorConfig extends Schema.Schema.Type<
  typeof VendorConfigSchema
> {}

export type OperationNamingOverride = Schema.Schema.Type<
  typeof OperationNamingOverrideSchema
>;

export type VendorConfigMetaName = (typeof metaNames)[number];

export { httpMethods as vendorConfigHttpMethods };
