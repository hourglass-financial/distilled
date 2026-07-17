/**
 * Erebor-specific error types.
 *
 * Re-exports common HTTP errors from sdk-core and adds Erebor-specific
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
  HTTP_STATUS_MAP,
  DEFAULT_ERRORS,
  API_ERRORS,
} from "@distilled.cloud/core/errors";
export type { DefaultErrors } from "@distilled.cloud/core/errors";

import * as Schema from "effect/Schema";
import * as Category from "@distilled.cloud/core/category";

/**
 * Structured per-field detail entry attached to `EreborValidationError`.
 *
 * Mirrors the `FIELD_ERROR` variant of the spec's `ErrorDetail` discriminated
 * union: `{ error_detail_type, field, message }`. The schema is intentionally
 * permissive (extra fields tolerated) because the vendor may add new
 * `error_detail_type` variants in the future.
 */
export class EreborErrorDetail extends Schema.Class<EreborErrorDetail>(
  "EreborErrorDetail",
)({
  error_detail_type: Schema.String,
  field: Schema.optional(Schema.String),
  message: Schema.optional(Schema.String),
}) {}

/**
 * Validation error - HTTP 422 with a structured `error_details` array.
 *
 * Erebor returns 422 with `error: "VALIDATION_ERROR"` for sub-resource
 * validation failures (e.g. creating a person applicant whose required
 * KYC fields are missing). The `error_details` array carries per-field
 * `FIELD_ERROR` entries that callers need to surface to end-users.
 *
 * The base `UnprocessableEntity` from core only carries `message`, dropping
 * the field-level breakdown — this class preserves it.
 */
export class EreborValidationError extends Schema.TaggedErrorClass<EreborValidationError>()(
  "EreborValidationError",
  {
    message: Schema.String,
    code: Schema.optional(Schema.String),
    field: Schema.optional(Schema.NullOr(Schema.String)),
    error_details: Schema.optional(
      Schema.NullOr(Schema.Array(EreborErrorDetail)),
    ),
  },
).pipe(Category.withBadRequestError) {}

/**
 * Returned when Erebor responds 429 with a "not enabled" message —
 * observed for permission-style failures like "Programmatic account
 * closure is not enabled for this API key.", which the vendor folds
 * into a 429 envelope (still tagged `error: "RATE_LIMITED"`) but which
 * is **not** retryable. Because the `error` code is reused, the
 * disambiguation has to come from the message text.
 *
 * Categorized as an auth error so it routes alongside 401/403 in
 * downstream `catchAuthError` handlers and so the retry policy does
 * not blindly back off and re-issue the disallowed request.
 */
export class EreborFeatureNotEnabled extends Schema.TaggedErrorClass<EreborFeatureNotEnabled>()(
  "EreborFeatureNotEnabled",
  {
    message: Schema.String,
    code: Schema.optional(Schema.String),
  },
).pipe(Category.withAuthError) {}

// Unknown Erebor error - returned when an error code is not recognized
export class UnknownEreborError extends Schema.TaggedErrorClass<UnknownEreborError>()(
  "UnknownEreborError",
  {
    code: Schema.optional(Schema.String),
    message: Schema.optional(Schema.String),
    body: Schema.Unknown,
  },
) {}

// Schema parse error wrapper
export class EreborParseError extends Schema.TaggedErrorClass<EreborParseError>()(
  "EreborParseError",
  {
    body: Schema.Unknown,
    cause: Schema.Unknown,
  },
).pipe(Category.withParseError) {}
