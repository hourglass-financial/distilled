/**
 * Error classification — instance-carried, symbol-keyed metadata in the style
 * of Effect's own `TypeId` branding.
 *
 * Every error class in the factory declares its classification once, as a
 * symbol-keyed class field pointing at a shared literal-typed constant:
 *
 * ```ts
 * class Unauthorized extends Schema.TaggedErrorClass<Unauthorized>()(
 *   "Unauthorized",
 *   { message: Schema.String },
 * ) {
 *   readonly [MetaKey] = Meta.auth;
 * }
 * ```
 *
 * The symbol key puts the classification in every instance's *type* (the
 * {@link Classified} interface) while keeping it out of every instance's
 * *data*: symbol keys never appear in `JSON.stringify`, string-keyed
 * enumeration, or wire payloads. Checks are ordinary type guards — no
 * constructor reflection, no shape sniffing — and because each `Meta.*`
 * constant is literal-typed, {@link hasCategory} is a refinement that narrows
 * an error union to the members in the given categories:
 *
 * ```ts
 * program.pipe(
 *   Effect.catchIf(hasCategory("challenge"), (e) => handleChallenge(e)),
 * ); // e: only the union members whose category is "challenge"
 * ```
 *
 * Two earlier mechanisms were rejected: v1 stamped booleans onto class
 * prototypes under symbol keys (invisible to the type system — #21), and a
 * `static meta` variant read via `error.constructor` (reflection, and no
 * value-level narrowing).
 */
import * as Duration from "effect/Duration";
import * as Predicate from "effect/Predicate";
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

/** Classification metadata carried by every factory error. */
export interface ErrorMeta {
  readonly category: Category;
  readonly retry: RetryDisposition;
}

/** The symbol under which an error instance carries its {@link ErrorMeta}. */
export const MetaKey: unique symbol = Symbol.for(
  "@hourglass-financial/api-factory-core/ErrorMeta",
);

/**
 * An error value carrying its classification. `M` stays literal-typed when a
 * class assigns one of the {@link Meta} constants, which is what lets
 * {@link hasCategory} narrow unions.
 */
export interface Classified<out M extends ErrorMeta = ErrorMeta> {
  readonly [MetaKey]: M;
}

/**
 * The classification vocabulary — every category paired with its one honest
 * retry disposition. A vendor needing an exotic pairing can still assign its
 * own `{ category, retry } as const satisfies ErrorMeta`; these constants
 * cover every pairing the HTTP domain actually has.
 */
export const Meta = {
  auth: { category: "auth", retry: "none" },
  badRequest: { category: "bad-request", retry: "none" },
  notFound: { category: "not-found", retry: "none" },
  conflict: { category: "conflict", retry: "none" },
  unprocessable: { category: "unprocessable", retry: "none" },
  throttling: { category: "throttling", retry: "throttling" },
  server: { category: "server", retry: "transient" },
  locked: { category: "locked", retry: "transient" },
  quota: { category: "quota", retry: "none" },
  challenge: { category: "challenge", retry: "none" },
  config: { category: "config", retry: "none" },
  parse: { category: "parse", retry: "none" },
  transport: { category: "transport", retry: "transient" },
  unknown: { category: "unknown", retry: "none" },
} as const satisfies Record<string, ErrorMeta>;

/** True when `value` carries factory classification metadata. */
export const isClassified = (value: unknown): value is Classified =>
  Predicate.hasProperty(value, MetaKey);

/**
 * The classification carried by `error`, or `undefined` for values from
 * outside the factory (Effect's own errors, plain thrown values).
 */
export const metaOf = (error: unknown): ErrorMeta | undefined =>
  isClassified(error) ? error[MetaKey] : undefined;

/**
 * Refinement matching errors in any of the given categories. Narrows a typed
 * error union to exactly the members whose declared category matches, so a
 * handler sees only what it can actually receive:
 *
 * ```ts
 * authenticateWithPassword(input).pipe(
 *   Effect.catchIf(hasCategory("challenge"), redirectToChallenge),
 * );
 * ```
 */
export const hasCategory =
  <const C extends Category>(
    ...categories: readonly [C, ...ReadonlyArray<C>]
  ) =>
  <E>(
    error: E,
  ): error is Extract<E, Classified<ErrorMeta & { category: C }>> => {
    const meta = metaOf(error);
    return (
      meta !== undefined &&
      (categories as ReadonlyArray<Category>).includes(meta.category)
    );
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
export const retryAfterOf = (error: unknown): Duration.Duration | undefined =>
  Predicate.hasProperty(error, "retryAfter") &&
  Duration.isDuration(error.retryAfter)
    ? error.retryAfter
    : undefined;
