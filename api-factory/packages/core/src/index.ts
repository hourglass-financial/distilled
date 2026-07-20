/**
 * `@hourglass-financial/api-factory-core` — the hand-written runtime machinery
 * every generated client imports: base errors, instance-carried error
 * classification, retry, cursor pagination, redaction, the operation model,
 * and the request executor + error matcher.
 *
 * A generated client stays thin: it declares operation descriptors and vendor
 * error classes/maps, then wires one `makeRunner`/`makeMatchError` pair. All
 * real behavior — retry-after honoring, redaction, error gating, pagination —
 * lives behind this small surface.
 */

// Base HTTP-status errors, matcher tables, and the `ClassifiedErrorClass` bound.
export * from "./errors.ts";

// Error classification (categories + retry disposition), carried on every
// error instance under the `MetaKey` symbol. `Meta`/`MetaKey` are top-level
// because every generated error class declares `readonly [MetaKey] = Meta.…`.
export * as Category from "./category.ts";
export { Meta, MetaKey } from "./category.ts";

// Redaction helpers for request/response secrets and error-carried values.
export { RedactedValue, Secret } from "./redaction.ts";

// Retry policy + honest `Retry-After` backoff schedule.
export * as Retry from "./retry.ts";
export { MAX_HINT, parseRetryAfter } from "./retry-after.ts";

// Cursor pagination (Stream of pages / Stream of items).
export * as Pagination from "./pagination.ts";

// Operation descriptor + request planning.
export {
  type HttpMethod,
  type InputSchema,
  isVoidOutput,
  type Operation,
  type OutputSchema,
  planRequest,
  type RequestPlan,
  type RequestSpec,
} from "./operation.ts";

// Request execution + error matching.
export {
  type DecodePhase,
  type ErrorEnvelope,
  makeMatchError,
  makeRunner,
  type MatchError,
  type MatchErrorConfig,
  type Runner,
  type RunnerDeps,
} from "./client.ts";

// Request assembly + response reading — the transport seam shared by the
// runner and the raw-request primitive.
export {
  assembleRequest,
  type AuthDeps,
  readBody,
  summarizeHttpClientError,
  type TransportFailure,
} from "./transport.ts";

// Raw requests for probes and negative tests (#30 decision 8): the planner's
// auth/transport path minus encode/decode/matching; non-2xx is data.
export {
  makeRawRequest,
  type RawQueryValue,
  type RawRequest,
  type RawRequestBody,
  type RawRequestDeps,
  type RawRequestOptions,
  type RawResponse,
  RawTransportError,
} from "./raw.ts";
