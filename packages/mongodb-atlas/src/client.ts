/**
 * Mongodb-atlas API Client.
 *
 * Wraps the shared REST client from sdk-core with Mongodb-atlas-specific
 * error matching and credential handling.
 */
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import { makeAPI } from "@distilled.cloud/core/client";
import { parseRetryAfterForStatus } from "@distilled.cloud/core/retry-after";
import { Retry } from "./retry.ts";
import {
  HTTP_STATUS_MAP,
  PaymentRequired,
  UnknownMongodbAtlasError,
  MongodbAtlasParseError,
} from "./errors.ts";

// Extend the core status map with Atlas-specific error classes
const STATUS_MAP = {
  ...HTTP_STATUS_MAP,
  402: PaymentRequired,
} as const;

// Re-export for backwards compatibility
export { UnknownMongodbAtlasError } from "./errors.ts";
import { Credentials } from "./credentials.ts";

type ClientError =
  | InstanceType<(typeof STATUS_MAP)[keyof typeof STATUS_MAP]>
  | UnknownMongodbAtlasError;

// MongoDB Atlas API Error Response Schema
// Matches the ApiError model: { error: int, errorCode: string, reason?: string, detail?: string }
const ApiErrorResponse = Schema.Struct({
  error: Schema.Number,
  errorCode: Schema.String,
  reason: Schema.optional(Schema.String),
  detail: Schema.optional(Schema.String),
});

/**
 * Match a Mongodb-atlas API error response to the appropriate error class based on HTTP status.
 */
const matchError = (
  status: number,
  errorBody: unknown,
  _errors?: readonly unknown[],
  headers?: Record<string, string | undefined>,
): Effect.Effect<never, ClientError> => {
  try {
    const parsed = Schema.decodeUnknownSync(ApiErrorResponse)(errorBody);
    const ErrorClass = STATUS_MAP[status as keyof typeof STATUS_MAP];
    if (ErrorClass) {
      return Effect.fail(
        new ErrorClass({
          message: parsed.detail ?? parsed.reason ?? "",
          retryAfter: parseRetryAfterForStatus(status, headers),
        }),
      );
    }
    return Effect.fail(
      new UnknownMongodbAtlasError({
        errorCode: parsed.errorCode,
        reason: parsed.reason,
        detail: parsed.detail,
        body: errorBody,
      }),
    );
  } catch {
    return Effect.fail(new UnknownMongodbAtlasError({ body: errorBody }));
  }
};

/**
 * Mongodb-atlas API client.
 */
export const API = makeAPI<
  Credentials,
  never,
  ClientError,
  MongodbAtlasParseError
>({
  credentials: Credentials as any,
  getBaseUrl: (creds: any) => creds.apiBaseUrl,
  getAuthHeaders: (creds: any) => ({
    Authorization: `Bearer ${Redacted.value(creds.accessToken)}`,
  }),
  matchError,
  ParseError: MongodbAtlasParseError as any,
  retry: Retry as any,
});
