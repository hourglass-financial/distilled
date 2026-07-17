/**
 * `@hourglass-financial/api-factory-core` — the hand-written runtime machinery
 * every generated client imports: base errors, static error classification,
 * retry, cursor pagination, redaction, the operation model, and the request
 * executor + error matcher.
 *
 * A generated client stays thin: it declares operation descriptors and vendor
 * error classes/maps, then wires one `makeRunner`/`makeMatchError` pair. All
 * real behavior — retry-after honoring, redaction, error gating, pagination —
 * lives behind this small surface.
 */

// Base HTTP-status errors, maps, and the `ErrorClass` bound.
export * from "./errors.ts";

// Static error classification (categories + retry disposition).
export * as Category from "./category.ts";

// Redaction helper for request/response secrets.
export { Secret } from "./redaction.ts";

// Retry policy + honest `Retry-After` backoff schedule.
export * as Retry from "./retry.ts";
export {
  MAX_HINT,
  parseRetryAfter,
  retryAfterForStatus,
} from "./retry-after.ts";

// Cursor pagination (Stream of pages / Stream of items).
export * as Pagination from "./pagination.ts";

// Operation descriptor + request planning.
export {
  type HttpMethod,
  isVoidOutput,
  type Operation,
  planRequest,
  type RequestPlan,
} from "./operation.ts";

// Request execution + error matching.
export {
  type ErrorEnvelope,
  makeMatchError,
  makeRunner,
  type MatchError,
  type MatchErrorConfig,
  type Runner,
  type RunnerDeps,
} from "./client.ts";
