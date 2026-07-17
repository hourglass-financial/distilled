/**
 * Persona API Client.
 *
 * Wraps the shared REST client from sdk-core with Persona-specific
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
import {
  HTTP_STATUS_MAP,
  DEFAULT_ERRORS,
  type DefaultErrors,
  UnknownPersonaError,
  PersonaParseError,
} from "./errors.ts";

// Re-export for backwards compatibility
export { UnknownPersonaError } from "./errors.ts";
import { Credentials } from "./credentials.ts";
import { Retry } from "./retry.ts";

type UniversalClientError = DefaultErrors | UnknownPersonaError;
type OperationClientError<E extends readonly ApiErrorClass[]> =
  | UniversalClientError
  | InstanceType<E[number]>;

// API Error Response Schema
const PersonaError = Schema.Struct({
  title: Schema.optional(Schema.String),
  details: Schema.optional(Schema.String),
  meta: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
});

const ApiErrorResponse = Schema.Struct({
  errors: Schema.Array(PersonaError),
});

const RETRYABLE_HTTP_STATUSES = new Set([408, 423, 429, 500, 502, 503, 504]);

const getMessage = (parsed: typeof ApiErrorResponse.Type): string => {
  const first = parsed.errors[0];
  return first?.details ?? first?.title ?? "";
};

/**
 * Match a Persona API error response to the appropriate error class based on HTTP status.
 *
 * For status codes whose error class declares `retryAfter`, pass
 * `retryAfter: parseRetryAfterForStatus(status, headers)`. That is `undefined`
 * when no standard `Retry-After` / `RateLimit` hint is present — omitting the
 * field is fine; the default retry policy still uses exponential backoff.
 * For bespoke rate-limit hints, parse them here and pass `retryAfter` when known.
 */
const matchError = <const E extends readonly ApiErrorClass[] = readonly []>(
  status: number,
  errorBody: unknown,
  errors?: E,
  headers?: Record<string, string | undefined>,
): Effect.Effect<never, OperationClientError<E>> => {
  try {
    const parsed = Schema.decodeUnknownSync(ApiErrorResponse)(errorBody);
    const message = getMessage(parsed);
    const ErrorClass = (HTTP_STATUS_MAP as Record<number, ApiErrorClass>)[
      status
    ];
    if (
      ErrorClass &&
      isErrorClassAllowedForOperation(ErrorClass, errors, DEFAULT_ERRORS)
    ) {
      const args: { message: string; retryAfter?: unknown } = { message };
      if (RETRYABLE_HTTP_STATUSES.has(status)) {
        args.retryAfter = parseRetryAfterForStatus(status, headers);
      }
      return Effect.fail(new ErrorClass(args)) as Effect.Effect<
        never,
        OperationClientError<E>
      >;
    }
    return Effect.fail(
      new UnknownPersonaError({
        code: parsed.errors[0]?.title,
        message,
        errors: parsed.errors,
        body: errorBody,
      }),
    );
  } catch {
    return Effect.fail(new UnknownPersonaError({ body: errorBody }));
  }
};

/**
 * Persona API client.
 */
export const API = makeAPI<
  Credentials,
  never,
  UniversalClientError,
  PersonaParseError
>({
  credentials: Credentials as any,
  getBaseUrl: (creds: any) => creds.apiBaseUrl,
  getAuthHeaders: (creds: any): Record<string, string> => ({
    Authorization: `Bearer ${Redacted.value(creds.apiKey)}`,
  }),
  matchError,
  ParseError: PersonaParseError as any,
  retry: Retry as any,
});
