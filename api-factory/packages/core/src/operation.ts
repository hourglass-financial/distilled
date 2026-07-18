/**
 * Operation descriptor — the fully-typed, declarative shape a generated client
 * emits per endpoint, and the request planner that turns it into wire parts.
 *
 * v1 encoded HTTP bindings as schema annotations and reconstructed requests by
 * walking the schema AST at runtime, which forced every generated op to launder
 * its schema through `as unknown as GeneratedStructCodec<T>` (a lie to the type
 * system). Here an operation is a plain object: method, path template, and the
 * *names* of the input fields that bind to the path or query. Everything else
 * is the JSON body. No AST introspection, no casts — a deterministic emitter
 * writes this, and `tsc` checks every field name against the input type.
 */
import type * as Schema from "effect/Schema";
import * as SchemaAST from "effect/SchemaAST";
import type { RetryDisposition } from "./category.ts";
import type { ClassifiedErrorClass } from "./errors.ts";

/** HTTP methods a generated operation can use. */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

/**
 * Bound for operation input schemas: encodable without services, so the
 * runner's requirement channel stays `never`. A service-bearing schema is a
 * compile error at the descriptor, not a silent requirement leak.
 */
export type InputSchema = Schema.Top & { readonly EncodingServices: never };

/** Bound for operation output schemas: decodable without services. */
export type OutputSchema = Schema.Top & { readonly DecodingServices: never };

/**
 * A single API operation.
 *
 * @typeParam IS - input schema; its `Type` is what the caller passes.
 * @typeParam OS - output schema; its `Type` is what the operation resolves to.
 * @typeParam EC - the operation's declared typed errors (a `const` tuple).
 */
export interface Operation<
  IS extends InputSchema,
  OS extends OutputSchema,
  EC extends readonly ClassifiedErrorClass[],
> {
  /** Clean, public dotted id, e.g. `"organizations.create"`. Used as span name. */
  readonly id: string;
  readonly method: HttpMethod;
  /**
   * What this operation may retry, derived from method semantics by the
   * generator: `"transient"` for safe/idempotent reads (GET/HEAD), where a
   * replayed request is harmless; `"throttling"` for mutating operations
   * (POST/DELETE/...), where replaying after an ambiguous transport failure
   * could double-create — or, for a DELETE that already succeeded, surface a
   * spurious 403/404 — so only explicit rate limits are retried. The consumer's
   * `RetryPolicy` further narrows (never widens) this; see `Retry.apply`.
   */
  readonly retry: RetryDisposition;
  /** Path template with `{param}` placeholders. */
  readonly pathTemplate: string;
  /** Input field names bound into the path template. */
  readonly pathParams: ReadonlyArray<keyof IS["Type"] & string>;
  /** Input field names sent as query parameters. */
  readonly queryParams: ReadonlyArray<keyof IS["Type"] & string>;
  /** Input schema — encoded on the request path so redacted fields unwrap. */
  readonly input: IS;
  /** Output schema — decoded from the response body. */
  readonly output: OS;
  /** The operation's documented typed errors, beyond the universal defaults. */
  readonly errors: EC;
  /** Constant body fields merged into every request (e.g. `{ grant_type }`). */
  readonly constantBody?: Readonly<Record<string, unknown>>;
}

/** Wire parts produced from an operation + input. */
export interface RequestPlan {
  readonly path: string;
  readonly query: Record<string, string>;
  readonly body: Record<string, unknown> | undefined;
}

/**
 * The runtime-facing subset of an {@link Operation} the request planner reads.
 * Every `Operation<IS, OS, EC>` structurally satisfies this (its typed
 * `pathParams`/`queryParams` widen to `readonly string[]`), so the planner
 * stays generic without threading schema type parameters.
 */
export interface RequestSpec {
  readonly method: HttpMethod;
  readonly pathTemplate: string;
  readonly pathParams: readonly string[];
  readonly queryParams: readonly string[];
  readonly constantBody?: Readonly<Record<string, unknown>>;
}

const isEmpty = (record: Record<string, unknown>): boolean =>
  Object.keys(record).length === 0;

/**
 * Turn an operation + already-encoded (wire) input into request parts.
 *
 * Path params substitute into the template; query params serialize (arrays
 * comma-joined, WorkOS's `form`/`explode: false` convention); everything else,
 * for body-bearing methods, becomes the JSON body alongside any `constantBody`.
 *
 * Generator invariant: the descriptor's `pathParams`/`queryParams` name keys of
 * the *decoded* input type, but the planner reads them off the *encoded* wire
 * record. The two agree only while the input schema maps every field to the
 * same key on the wire (the snake-case-verbatim convention). A generator that
 * ever introduces key renaming must bind these to encoded names instead.
 */
export const planRequest = (
  op: RequestSpec,
  wire: Record<string, unknown>,
): RequestPlan => {
  let path = op.pathTemplate;
  for (const name of op.pathParams) {
    path = path.replace(`{${name}}`, encodeURIComponent(String(wire[name])));
  }

  const query: Record<string, string> = {};
  for (const name of op.queryParams) {
    const value = wire[name];
    if (value === undefined || value === null) continue;
    query[name] = Array.isArray(value)
      ? value.map(String).join(",")
      : String(value);
  }

  let body: Record<string, unknown> | undefined;
  if (op.method !== "GET" && op.method !== "HEAD") {
    const skip = new Set<string>([...op.pathParams, ...op.queryParams]);
    const built: Record<string, unknown> = { ...op.constantBody };
    for (const [key, value] of Object.entries(wire)) {
      if (skip.has(key) || value === undefined) continue;
      built[key] = value;
    }
    body = isEmpty(built) ? undefined : built;
  }

  return { path, query, body };
};

/** True when an operation returns no body (e.g. a 204/200 DELETE). */
export const isVoidOutput = (op: { readonly output: Schema.Top }): boolean =>
  SchemaAST.isVoid(op.output.ast);
