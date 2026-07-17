/**
 * Erebor API Client.
 *
 * This is the standard sdk-core client scaffold — the same `makeAPI` + `matchError`
 * shape every package in this repo uses (cf. `packages/neon/src/client.ts`) —
 * customized for Erebor's API in the places the `create-sdk` pipeline is designed
 * to customize per-SDK. It is a per-package file, not shared code, so it carries no
 * `HOURGLASS PATCH` markers; the notes below document where it diverges from the
 * generated scaffold default so the custom surface is obvious to future readers.
 *
 * Erebor-specific deviations from the scaffold default:
 *   1. Auth — the API key is sent verbatim as the `Authorization` header value with
 *      NO `Bearer` prefix (the scaffold default is `Bearer <key>`). See `getAuthHeaders`.
 *   2. Error body shape — `{ error, message, field?, docs_url?, error_details? }`
 *      (the scaffold's `ApiErrorResponse` is just `{ code?, message }`). `error` is the
 *      machine code (e.g. `UNAUTHORIZED`, `INVALID_REQUEST`); `message` is human text.
 *   3. `matchError` adds two body-aware special cases on top of the scaffold's plain
 *      status -> `HTTP_STATUS_MAP` mapping: 422 `VALIDATION_ERROR` -> `EreborValidationError`
 *      (preserving `error_details`), and 429 feature-gate messages ->
 *      `EreborFeatureNotEnabled` (see the `matchError` doc comment).
 *   4. `retryAfter` is attached only for genuinely retryable statuses
 *      (`RETRYABLE_HTTP_STATUSES`); the scaffold attaches it unconditionally.
 *
 * Everything else (the `makeAPI` wiring, the decode-then-map control flow, and the
 * `Unknown*` fallback) is unmodified scaffold.
 */
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import { makeAPI } from "@distilled.cloud/core/client";
import { parseRetryAfterForStatus } from "@distilled.cloud/core/retry-after";
import {
  HTTP_STATUS_MAP,
  UnknownEreborError,
  EreborParseError,
  EreborValidationError,
  EreborFeatureNotEnabled,
  EreborErrorDetail,
} from "./errors.ts";

// Re-export for backwards compatibility
export { UnknownEreborError } from "./errors.ts";
import { Credentials } from "./credentials.ts";
import { Retry } from "./retry.ts";

type ClientError =
  | InstanceType<(typeof HTTP_STATUS_MAP)[keyof typeof HTTP_STATUS_MAP]>
  | EreborValidationError
  | EreborFeatureNotEnabled
  | UnknownEreborError;

// API Error Response Schema
const ApiErrorResponse = Schema.Struct({
  error: Schema.optional(Schema.String),
  message: Schema.optional(Schema.String),
  field: Schema.optional(Schema.NullOr(Schema.String)),
  docs_url: Schema.optional(Schema.NullOr(Schema.String)),
  error_details: Schema.optional(
    Schema.NullOr(Schema.Array(EreborErrorDetail)),
  ),
});

/**
 * HTTP statuses whose error class in `HTTP_STATUS_MAP` declares a
 * `retryAfter` field. Passing `retryAfter` to non-retryable classes
 * (`BadRequest`/`NotFound`/etc.) would silently retain the value on the
 * instance and pollute serialized output, so gate the construction.
 */
const RETRYABLE_HTTP_STATUSES = new Set([423, 429, 500, 502, 503, 504]);

/**
 * Match an Erebor API error response to the appropriate error class based on
 * HTTP status. The `error` field carries the machine-readable code (e.g.
 * `UNAUTHORIZED`, `INVALID_REQUEST`); the `message` field carries the
 * human-readable description.
 *
 * Special cases:
 * - 422 with `error: "VALIDATION_ERROR"` -> `EreborValidationError`,
 *   preserving the `error_details` array for per-field surfacing.
 * - 429 whose message contains "not enabled" (observed:
 *   "Programmatic account closure is not enabled for this API key.")
 *   or "not yet available" (observed: "Renaming blockchain addresses
 *   is not yet available.") -> `EreborFeatureNotEnabled`. Erebor folds
 *   permission/feature-gate failures into the rate-limit status and
 *   reuses `error: "RATE_LIMITED"`, so the *message* is the only
 *   reliable disambiguator.
 */
const matchError = (
  status: number,
  errorBody: unknown,
  _errors?: readonly unknown[],
  headers?: Record<string, string | undefined>,
): Effect.Effect<never, ClientError> => {
  try {
    const parsed = Schema.decodeUnknownSync(ApiErrorResponse)(errorBody);
    const message = parsed.message ?? parsed.error ?? "";

    // 422 — surface structured field errors rather than dropping them
    // into a bare UnprocessableEntity instance.
    if (status === 422 && parsed.error === "VALIDATION_ERROR") {
      return Effect.fail(
        new EreborValidationError({
          message,
          code: parsed.error,
          field: parsed.field,
          error_details: parsed.error_details,
        }),
      );
    }

    // 429 — Erebor folds permission/feature-gate failures ("feature not
    // enabled for this API key", "... is not yet available") into the
    // rate-limit status, *still* tagged with `error: "RATE_LIMITED"`. The
    // only reliable signal is the message text. Detecting this lets the
    // retry policy skip a request that will never succeed.
    if (status === 429 && /not enabled|not yet available/i.test(message)) {
      return Effect.fail(
        new EreborFeatureNotEnabled({ message, code: parsed.error }),
      );
    }

    const ErrorClass = (HTTP_STATUS_MAP as any)[status];
    if (ErrorClass) {
      const args: { message: string; retryAfter?: unknown } = { message };
      if (RETRYABLE_HTTP_STATUSES.has(status)) {
        args.retryAfter = parseRetryAfterForStatus(status, headers);
      }
      return Effect.fail(new ErrorClass(args));
    }
    return Effect.fail(
      new UnknownEreborError({
        code: parsed.error,
        message: parsed.message,
        body: errorBody,
      }),
    );
  } catch {
    return Effect.fail(new UnknownEreborError({ body: errorBody }));
  }
};

/**
 * Erebor API client.
 */
export const API = makeAPI<Credentials, never, ClientError, EreborParseError>({
  credentials: Credentials as any,
  getBaseUrl: (creds: any) => creds.apiBaseUrl,
  getAuthHeaders: (creds: any): Record<string, string> => ({
    Authorization: Redacted.value(creds.apiKey),
  }),
  matchError,
  ParseError: EreborParseError as any,
  retry: Retry as any,
});
