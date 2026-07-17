/**
 * Error classification — the "better mechanism" that replaces v1's
 * prototype-mutation category system.
 *
 * v1 (`packages/core/src/category.ts`) stamped category/retryability booleans
 * onto each error class's `prototype` under symbol keys. That was rejected in
 * the core-runtime inventory (#21): prototype writes are invisible to the type
 * system, non-obvious to readers, and pollute every instance's inspected shape.
 *
 * Here, classification is a plain **static property** (`meta`) on each error
 * class, declared alongside the class and therefore mechanically checkable by
 * `tsc`. The runtime reads it back through the instance's constructor. No
 * prototype writes, no per-instance fields, no symbol indirection.
 */
import * as Duration from "effect/Duration";
import * as HttpClientError from "effect/unstable/http/HttpClientError";

/**
 * Semantic grouping of an error, for consumers that want to react to a class
 * of failures ("any auth error") rather than a specific `_tag`.
 */
export type Category =
  | "auth"
  | "bad-request"
  | "not-found"
  | "conflict"
  | "unprocessable"
  | "throttling"
  | "server"
  | "locked"
  | "quota"
  | "challenge"
  | "config"
  | "parse"
  | "transport"
  | "unknown";

/**
 * How the retry policy should treat an error:
 * - `none` — never retried (client errors, auth failures, validation).
 * - `transient` — retried with backoff (5xx, locked, transport).
 * - `throttling` — retried, honoring `Retry-After` with a floor (429).
 */
export type RetryDisposition = "none" | "transient" | "throttling";

/**
 * Static classification metadata attached to an error class. Emitted (or
 * hand-written) as `static readonly meta` next to the class definition.
 */
export interface ErrorMeta {
  readonly category: Category;
  readonly retry: RetryDisposition;
}

/**
 * An error class that carries {@link ErrorMeta} as a static property.
 * `defineError`-style helpers and the base HTTP error classes satisfy this.
 */
export interface ClassifiedErrorClass {
  readonly meta: ErrorMeta;
}

const isErrorMeta = (value: unknown): value is ErrorMeta =>
  typeof value === "object" &&
  value !== null &&
  "category" in value &&
  "retry" in value;

/**
 * Read the static {@link ErrorMeta} off an error value via its constructor.
 * Returns `undefined` for errors that carry no classification (e.g. Effect's
 * own `HttpClientError`, or a plain thrown value).
 */
export const metaOf = (error: unknown): ErrorMeta | undefined => {
  if (typeof error !== "object" || error === null) return undefined;
  const ctor = (error as { readonly constructor?: unknown }).constructor;
  if (typeof ctor !== "function") return undefined;
  const meta = (ctor as { readonly meta?: unknown }).meta;
  return isErrorMeta(meta) ? meta : undefined;
};

/**
 * True when `error` is an Effect `HttpClientError` caused by a wire-level
 * transport failure (connect/read timeout, socket reset, DNS failure,
 * premature close). The request never completed, so retrying is safe.
 */
export const isTransportError = (error: unknown): boolean =>
  HttpClientError.isHttpClientError(error) &&
  error.reason._tag === "TransportError";

/**
 * Semantic category of an error. Falls back to `transport` for raw
 * `HttpClientError`s and `unknown` for everything unclassified.
 */
export const categoryOf = (error: unknown): Category => {
  const meta = metaOf(error);
  if (meta) return meta.category;
  if (isTransportError(error)) return "transport";
  return "unknown";
};

/** True when `error` is a throttling (rate-limit) failure. */
export const isThrottling = (error: unknown): boolean =>
  metaOf(error)?.retry === "throttling";

/**
 * True when `error` is transient and should be retried: any error classified
 * `transient`/`throttling`, plus wire-level transport failures.
 */
export const isTransient = (error: unknown): boolean => {
  const disposition = metaOf(error)?.retry;
  if (disposition === "transient" || disposition === "throttling") return true;
  return isTransportError(error);
};

/**
 * Server-provided wait hint carried by retryable errors (parsed from
 * `Retry-After` / `RateLimit` headers by the vendor's error matcher). Returns
 * `undefined` when the error carries no hint.
 */
export const retryAfterOf = (error: unknown): Duration.Duration | undefined => {
  const hint = (error as { readonly retryAfter?: unknown } | null | undefined)
    ?.retryAfter;
  return Duration.isDuration(hint) ? hint : undefined;
};
