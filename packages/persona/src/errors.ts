/**
 * Persona-specific error types.
 *
 * Re-exports common HTTP errors from sdk-core and adds Persona-specific
 * error matching and API error types.
 */
export {
  BadGateway,
  BadRequest,
  Conflict,
  ConfigError,
  Forbidden,
  GatewayTimeout,
  InternalServerError,
  Locked,
  NotFound,
  ServiceUnavailable,
  TooManyRequests,
  Unauthorized,
  UnprocessableEntity,
} from "@distilled.cloud/core/errors";
import {
  API_ERRORS as CORE_API_ERRORS,
  DEFAULT_ERRORS,
  DurationSchema,
  HTTP_STATUS_MAP as CORE_HTTP_STATUS_MAP,
} from "@distilled.cloud/core/errors";
export { DEFAULT_ERRORS };
export type { DefaultErrors } from "@distilled.cloud/core/errors";

import * as Schema from "effect/Schema";
import * as Category from "@distilled.cloud/core/category";

export class PersonaErrorDetail extends Schema.Class<PersonaErrorDetail>(
  "PersonaErrorDetail",
)({
  title: Schema.optional(Schema.String),
  details: Schema.optional(Schema.String),
  meta: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
}) {}

export class RequestTimeout extends Schema.TaggedErrorClass<RequestTimeout>()(
  "RequestTimeout",
  {
    message: Schema.String,
    retryAfter: Schema.optional(DurationSchema),
  },
).pipe(Category.withTimeoutError, Category.withRetryable()) {}

export const HTTP_STATUS_MAP = {
  ...CORE_HTTP_STATUS_MAP,
  408: RequestTimeout,
} as const;

export const API_ERRORS = [...CORE_API_ERRORS, RequestTimeout] as const;

// Unknown Persona error - returned when an error code is not recognized
export class UnknownPersonaError extends Schema.TaggedErrorClass<UnknownPersonaError>()(
  "UnknownPersonaError",
  {
    code: Schema.optional(Schema.String),
    message: Schema.optional(Schema.String),
    errors: Schema.optional(Schema.Array(PersonaErrorDetail)),
    body: Schema.Unknown,
  },
).pipe(Category.withServerError) {}

// Schema parse error wrapper
export class PersonaParseError extends Schema.TaggedErrorClass<PersonaParseError>()(
  "PersonaParseError",
  {
    body: Schema.Unknown,
    cause: Schema.Unknown,
  },
).pipe(Category.withParseError) {}
