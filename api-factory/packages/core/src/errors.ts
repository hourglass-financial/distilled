/**
 * Base HTTP-status error classes shared by every generated client.
 *
 * Each class is a schema-validated `Schema.TaggedErrorClass` and is the
 * single source of every fact about itself: its classification (symbol-keyed
 * instance field, see `category.ts`), the HTTP status it represents (a
 * `static readonly status` beside the class), and whether it can carry a
 * `Retry-After` hint (its own schema declares — or doesn't — a `retryAfter`
 * field). The matcher tables at the bottom of this file are *derived* from
 * the classes, never written by hand, so a fact can't drift from its class.
 *
 * Vendors re-export these and add their own code-discriminated errors; the
 * shared classes cover the status codes every REST API can return.
 */
import * as Schema from "effect/Schema";
import { type Classified, Meta, MetaKey } from "./category.ts";

// ---------------------------------------------------------------------------
// 4xx — client errors (not retryable)
// ---------------------------------------------------------------------------

/** 400 — the request was malformed. */
export class BadRequest extends Schema.TaggedErrorClass<BadRequest>()(
  "BadRequest",
  { message: Schema.String },
) {
  readonly [MetaKey] = Meta.badRequest;
  static readonly status = 400;
}

/** 401 — authentication failed (missing/invalid API key). */
export class Unauthorized extends Schema.TaggedErrorClass<Unauthorized>()(
  "Unauthorized",
  { message: Schema.String },
) {
  readonly [MetaKey] = Meta.auth;
  static readonly status = 401;
}

/** 403 — authenticated but not permitted. */
export class Forbidden extends Schema.TaggedErrorClass<Forbidden>()(
  "Forbidden",
  { message: Schema.String },
) {
  readonly [MetaKey] = Meta.auth;
  static readonly status = 403;
}

/** 404 — the resource does not exist. */
export class NotFound extends Schema.TaggedErrorClass<NotFound>()("NotFound", {
  message: Schema.String,
}) {
  readonly [MetaKey] = Meta.notFound;
  static readonly status = 404;
}

/** 409 — the request conflicts with existing state. */
export class Conflict extends Schema.TaggedErrorClass<Conflict>()("Conflict", {
  message: Schema.String,
}) {
  readonly [MetaKey] = Meta.conflict;
  static readonly status = 409;
}

/** 422 — the request was well-formed but semantically invalid. */
export class UnprocessableEntity extends Schema.TaggedErrorClass<UnprocessableEntity>()(
  "UnprocessableEntity",
  { message: Schema.String },
) {
  readonly [MetaKey] = Meta.unprocessable;
  static readonly status = 422;
}

// ---------------------------------------------------------------------------
// Retryable errors — carry an optional `retryAfter` hint
// ---------------------------------------------------------------------------

/** 423 — the resource is temporarily locked; retry after a short delay. */
export class Locked extends Schema.TaggedErrorClass<Locked>()("Locked", {
  message: Schema.String,
  retryAfter: Schema.optional(Schema.Duration),
}) {
  readonly [MetaKey] = Meta.locked;
  static readonly status = 423;
}

/** 429 — rate limited; retry honoring `Retry-After`. */
export class TooManyRequests extends Schema.TaggedErrorClass<TooManyRequests>()(
  "TooManyRequests",
  {
    message: Schema.String,
    retryAfter: Schema.optional(Schema.Duration),
  },
) {
  readonly [MetaKey] = Meta.throttling;
  static readonly status = 429;
}

/** 500 — the server failed unexpectedly. */
export class InternalServerError extends Schema.TaggedErrorClass<InternalServerError>()(
  "InternalServerError",
  {
    message: Schema.String,
    retryAfter: Schema.optional(Schema.Duration),
  },
) {
  readonly [MetaKey] = Meta.server;
  static readonly status = 500;
}

/** 502 — a bad response from an upstream. */
export class BadGateway extends Schema.TaggedErrorClass<BadGateway>()(
  "BadGateway",
  {
    message: Schema.String,
    retryAfter: Schema.optional(Schema.Duration),
  },
) {
  readonly [MetaKey] = Meta.server;
  static readonly status = 502;
}

/** 503 — the server is temporarily unavailable. */
export class ServiceUnavailable extends Schema.TaggedErrorClass<ServiceUnavailable>()(
  "ServiceUnavailable",
  {
    message: Schema.String,
    retryAfter: Schema.optional(Schema.Duration),
  },
) {
  readonly [MetaKey] = Meta.server;
  static readonly status = 503;
}

/** 504 — an upstream timed out. */
export class GatewayTimeout extends Schema.TaggedErrorClass<GatewayTimeout>()(
  "GatewayTimeout",
  {
    message: Schema.String,
    retryAfter: Schema.optional(Schema.Duration),
  },
) {
  readonly [MetaKey] = Meta.server;
  static readonly status = 504;
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
// Class bounds and derived tables
// ---------------------------------------------------------------------------

/**
 * The shape stored in operation error tuples and the status/code matcher
 * maps: a tagged error class whose instances carry their classification (the
 * `Classified` brand) and whose schema `fields` are introspectable. The
 * `any[]` constructor is the standard "some error class" bound — concrete
 * `errors` tuples keep the public unions precise via
 * `InstanceType<EC[number]>` — and requiring the brand here means a class
 * missing its `readonly [MetaKey]` field fails `tsc` at the table that would
 * construct it: a missing classification can never silently degrade to
 * "unclassified" at runtime.
 */
export type ClassifiedErrorClass = (new (
  // oxlint-disable-next-line no-explicit-any
  ...args: any[]
) => { readonly _tag: string; readonly message: string } & Classified) & {
  readonly fields: Readonly<Record<string, unknown>>;
};

/** A {@link ClassifiedErrorClass} bound to the HTTP status it represents. */
export type StatusErrorClass = ClassifiedErrorClass & {
  readonly status: number;
};

/**
 * A {@link ClassifiedErrorClass} whose schema pins its wire discriminator as
 * a `code` literal — the shape vendors feed to {@link byCode}.
 */
export type CodeErrorClass = ClassifiedErrorClass & {
  readonly fields: { readonly code: { readonly literal: string } };
};

/**
 * Build a status → class table from classes that each declare their own
 * `status`. Fails loudly at module load on a duplicate — two classes claiming
 * one status is a construction bug, never a runtime condition.
 */
export const byStatus = (
  classes: ReadonlyArray<StatusErrorClass>,
): Readonly<Record<number, StatusErrorClass>> => {
  const table: Record<number, StatusErrorClass> = {};
  for (const cls of classes) {
    if (table[cls.status] !== undefined) {
      throw new Error(
        `byStatus: duplicate error class for status ${cls.status}`,
      );
    }
    table[cls.status] = cls;
  }
  return table;
};

/**
 * Build a discriminator-code → class table from classes that each pin their
 * code as a schema literal. The map key is read off the class's own schema,
 * so a key can never disagree with the literal the class validates.
 */
export const byCode = (
  classes: ReadonlyArray<CodeErrorClass>,
): Readonly<Record<string, ClassifiedErrorClass>> => {
  const table: Record<string, ClassifiedErrorClass> = {};
  for (const cls of classes) {
    const code = cls.fields.code.literal;
    if (table[code] !== undefined) {
      throw new Error(`byCode: duplicate error class for code "${code}"`);
    }
    table[code] = cls;
  }
  return table;
};

/**
 * True when the class's own schema declares a `retryAfter` field — the single
 * source of truth for whether a parsed `Retry-After` hint can be threaded
 * into it. There is no hand-maintained "retryable statuses" set to drift.
 */
export const acceptsRetryAfter = (cls: ClassifiedErrorClass): boolean =>
  "retryAfter" in cls.fields;

/** HTTP status → shared error class, derived from each class's `status`. */
export const STATUS_ERRORS: Readonly<Record<number, StatusErrorClass>> =
  byStatus([
    BadRequest,
    Unauthorized,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
    Locked,
    TooManyRequests,
    InternalServerError,
    BadGateway,
    ServiceUnavailable,
    GatewayTimeout,
  ]);

/**
 * Errors that can arise on ANY operation, independent of its documented
 * response table: a bad API key (401), a rate limit (429), or a server fault
 * (5xx). Deliberately a hand-written list, not a derivation — universality is
 * a statement about the API domain, not a class-local fact.
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
