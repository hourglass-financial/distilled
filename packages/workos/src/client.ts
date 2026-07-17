/**
 * WorkOS API Client.
 *
 * Wraps the shared REST client from sdk-core with WorkOS-specific
 * error matching and credential handling.
 */
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import {
  type ApiErrorClass,
  isErrorClassAllowedForOperation,
  makeAPI,
} from "@distilled.cloud/core/client";
import { parseRetryAfterForStatus } from "@distilled.cloud/core/retry-after";
import { Retry } from "./retry.ts";
import {
  HTTP_STATUS_MAP,
  DEFAULT_ERRORS,
  type DefaultErrors,
  UnknownWorkosError,
  WorkosParseError,
} from "./errors.ts";

// Re-export for backwards compatibility
export { UnknownWorkosError } from "./errors.ts";
import { Credentials } from "./credentials.ts";

// HOURGLASS PATCH: Only errors that can arise independently of an operation's
// OpenAPI response table belong in every WorkOS operation channel.
type UniversalClientError = DefaultErrors | UnknownWorkosError;
type OperationClientError<E extends readonly ApiErrorClass[]> =
  | UniversalClientError
  | InstanceType<E[number]>;

/**
 * WorkOS API Error Response Schema.
 *
 * The WorkOS API returns errors with a human-readable `message` field; some
 * endpoints additionally include an error `code` and a structured `errors`
 * list of field-level validation problems.
 */
const ApiErrorResponse = Schema.Struct({
  message: Schema.String,
  code: Schema.optional(Schema.String),
  error: Schema.optional(Schema.String),
  error_description: Schema.optional(Schema.String),
});

/**
 * Match a WorkOS API error response to the appropriate error class based on
 * HTTP status.
 */
const matchError = <const E extends readonly ApiErrorClass[] = readonly []>(
  status: number,
  errorBody: unknown,
  errors?: E,
  headers?: Record<string, string | undefined>,
): Effect.Effect<never, OperationClientError<E>> => {
  // Try to extract a message and code from the body, but fall through to
  // status-code mapping regardless of whether the body parses as the
  // canonical WorkOS error shape. Some endpoints return non-JSON or
  // alternative shapes for 401/403/5xx — those still have well-known status
  // codes that map directly to typed error classes.
  let message = "";
  let code: string | undefined;
  try {
    const parsed = Schema.decodeUnknownSync(ApiErrorResponse)(errorBody);
    message = parsed.message ?? parsed.error_description ?? parsed.error ?? "";
    code = parsed.code;
  } catch {
    if (typeof errorBody === "object" && errorBody !== null) {
      const obj = errorBody as Record<string, unknown>;
      if (typeof obj.message === "string") message = obj.message;
      else if (typeof obj.error_description === "string")
        message = obj.error_description;
      else if (typeof obj.error === "string") message = obj.error;
      if (typeof obj.code === "string") code = obj.code;
    } else if (typeof errorBody === "string") {
      message = errorBody;
    }
  }
  const ErrorClass = (HTTP_STATUS_MAP as Record<number, ApiErrorClass>)[status];
  if (
    ErrorClass &&
    isErrorClassAllowedForOperation(ErrorClass, errors, DEFAULT_ERRORS)
  ) {
    return Effect.fail(
      new ErrorClass({
        message,
        retryAfter: parseRetryAfterForStatus(status, headers),
      }),
    ) as Effect.Effect<never, OperationClientError<E>>;
  }
  return Effect.fail(
    new UnknownWorkosError({ code, message, body: errorBody }),
  );
};

/**
 * WorkOS API client.
 */
export const API = makeAPI<
  Credentials,
  never,
  UniversalClientError,
  WorkosParseError
>({
  credentials: Credentials as any,
  getBaseUrl: (creds: any) => creds.apiBaseUrl,
  getAuthHeaders: (creds: any) => ({
    Authorization: `Bearer ${Redacted.value(creds.apiKey)}`,
  }),
  matchError,
  ParseError: WorkosParseError as any,
  retry: Retry as any,
});
