/**
 * Base HTTP-status error classes shared by every generated client.
 *
 * Each class is a schema-validated `Schema.TaggedErrorClass` carrying its
 * classification as a symbol-keyed instance field (`readonly [MetaKey] =
 * Meta.…` — see `category.ts` for why this is the mechanism).
 *
 * Vendors re-export these and add their own code-discriminated errors; the
 * shared classes cover the status codes every REST API can return.
 */
import * as Duration from "effect/Duration";
import * as Schema from "effect/Schema";
import { type Classified, Meta, MetaKey } from "./category.ts";

/**
 * Opaque schema for an Effect `Duration`. Retryable errors carry a
 * server-provided wait hint here (parsed from `Retry-After` at runtime); it is
 * never decoded from the wire, so a `declare` guard is all that's needed.
 */
export const DurationFromSelf: Schema.declare<Duration.Duration> =
  Schema.declare(Duration.isDuration);

// ---------------------------------------------------------------------------
// 4xx — client errors (not retryable)
// ---------------------------------------------------------------------------

/** 400 — the request was malformed. */
export class BadRequest extends Schema.TaggedErrorClass<BadRequest>()(
  "BadRequest",
  { message: Schema.String },
) {
  readonly [MetaKey] = Meta.badRequest;
}

/** 401 — authentication failed (missing/invalid API key). */
export class Unauthorized extends Schema.TaggedErrorClass<Unauthorized>()(
  "Unauthorized",
  { message: Schema.String },
) {
  readonly [MetaKey] = Meta.auth;
}

/** 403 — authenticated but not permitted. */
export class Forbidden extends Schema.TaggedErrorClass<Forbidden>()(
  "Forbidden",
  { message: Schema.String },
) {
  readonly [MetaKey] = Meta.auth;
}

/** 404 — the resource does not exist. */
export class NotFound extends Schema.TaggedErrorClass<NotFound>()("NotFound", {
  message: Schema.String,
}) {
  readonly [MetaKey] = Meta.notFound;
}

/** 409 — the request conflicts with existing state. */
export class Conflict extends Schema.TaggedErrorClass<Conflict>()("Conflict", {
  message: Schema.String,
}) {
  readonly [MetaKey] = Meta.conflict;
}

/** 422 — the request was well-formed but semantically invalid. */
export class UnprocessableEntity extends Schema.TaggedErrorClass<UnprocessableEntity>()(
  "UnprocessableEntity",
  { message: Schema.String },
) {
  readonly [MetaKey] = Meta.unprocessable;
}

// ---------------------------------------------------------------------------
// Retryable errors — carry an optional `retryAfter` hint
// ---------------------------------------------------------------------------

/** 423 — the resource is temporarily locked; retry after a short delay. */
export class Locked extends Schema.TaggedErrorClass<Locked>()("Locked", {
  message: Schema.String,
  retryAfter: Schema.optional(DurationFromSelf),
}) {
  readonly [MetaKey] = Meta.locked;
}

/** 429 — rate limited; retry honoring `Retry-After`. */
export class TooManyRequests extends Schema.TaggedErrorClass<TooManyRequests>()(
  "TooManyRequests",
  {
    message: Schema.String,
    retryAfter: Schema.optional(DurationFromSelf),
  },
) {
  readonly [MetaKey] = Meta.throttling;
}

/** 500 — the server failed unexpectedly. */
export class InternalServerError extends Schema.TaggedErrorClass<InternalServerError>()(
  "InternalServerError",
  {
    message: Schema.String,
    retryAfter: Schema.optional(DurationFromSelf),
  },
) {
  readonly [MetaKey] = Meta.server;
}

/** 502 — a bad response from an upstream. */
export class BadGateway extends Schema.TaggedErrorClass<BadGateway>()(
  "BadGateway",
  {
    message: Schema.String,
    retryAfter: Schema.optional(DurationFromSelf),
  },
) {
  readonly [MetaKey] = Meta.server;
}

/** 503 — the server is temporarily unavailable. */
export class ServiceUnavailable extends Schema.TaggedErrorClass<ServiceUnavailable>()(
  "ServiceUnavailable",
  {
    message: Schema.String,
    retryAfter: Schema.optional(DurationFromSelf),
  },
) {
  readonly [MetaKey] = Meta.server;
}

/** 504 — an upstream timed out. */
export class GatewayTimeout extends Schema.TaggedErrorClass<GatewayTimeout>()(
  "GatewayTimeout",
  {
    message: Schema.String,
    retryAfter: Schema.optional(DurationFromSelf),
  },
) {
  readonly [MetaKey] = Meta.server;
}

// ---------------------------------------------------------------------------
// Configuration — surfaced when credentials/config are missing
// ---------------------------------------------------------------------------

/** Missing or invalid client configuration (e.g. absent API key). */
export class ConfigError extends Schema.TaggedErrorClass<ConfigError>()(
  "ConfigError",
  { message: Schema.String },
) {
  readonly [MetaKey] = Meta.config;
}

// ---------------------------------------------------------------------------
// Maps and sets consumed by the error matcher / retry policy
// ---------------------------------------------------------------------------

/**
 * Any error class with a `_tag` — the shape stored in operation error tuples
 * and the status/code matcher maps. The `any[]` constructor is the standard
 * "some error class" bound; concrete `errors` tuples keep the public unions
 * precise via `InstanceType<EC[number]>`.
 */
export type ErrorClass = new (
  // oxlint-disable-next-line no-explicit-any
  ...args: any[]
) => { readonly _tag: string; readonly message: string };

/**
 * An {@link ErrorClass} whose instances carry their classification (the
 * `Classified` brand). Every matcher table and operation error tuple requires
 * this bound, so an error class missing its `readonly [MetaKey]` field fails
 * `tsc` at the table that would construct it — a missing classification can
 * never silently degrade to "unclassified" at runtime.
 */
export type ClassifiedErrorClass = new (
  // oxlint-disable-next-line no-explicit-any
  ...args: any[]
) => { readonly _tag: string; readonly message: string } & Classified;

/** HTTP status → shared error class. */
export const STATUS_ERRORS = {
  400: BadRequest,
  401: Unauthorized,
  403: Forbidden,
  404: NotFound,
  409: Conflict,
  422: UnprocessableEntity,
  423: Locked,
  429: TooManyRequests,
  500: InternalServerError,
  502: BadGateway,
  503: ServiceUnavailable,
  504: GatewayTimeout,
} as const satisfies Record<number, ClassifiedErrorClass>;

/**
 * Statuses whose error class declares a `retryAfter` field. The matcher only
 * threads a parsed `Retry-After` hint into these classes, so non-retryable
 * classes never carry a stale hint.
 */
export const RETRYABLE_STATUSES: ReadonlySet<number> = new Set([
  423, 429, 500, 502, 503, 504,
]);

/**
 * Errors that can arise on ANY operation, independent of its documented
 * response table: a bad API key (401), a rate limit (429), or a server fault
 * (5xx). Every generated operation's error channel includes these.
 */
export const DEFAULT_ERRORS = [
  Unauthorized,
  TooManyRequests,
  InternalServerError,
  BadGateway,
  ServiceUnavailable,
  GatewayTimeout,
] as const satisfies readonly ClassifiedErrorClass[];

/** Instance union of {@link DEFAULT_ERRORS}. */
export type DefaultError = InstanceType<(typeof DEFAULT_ERRORS)[number]>;
