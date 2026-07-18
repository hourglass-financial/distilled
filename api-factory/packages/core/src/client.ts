/**
 * Request execution and error matching — the deep core of the runtime.
 *
 * `makeMatchError` turns a vendor's error envelope + status/code maps into a
 * per-operation matcher that only ever constructs an error the operation
 * actually declares (or a universal default), falling back to the vendor's
 * `Unknown*` error otherwise — the battle-tested v1 gating, kept.
 *
 * `makeRunner` is the single request pipeline every generated operation flows
 * through: encode input (unwrapping redacted secrets), plan the request,
 * execute, branch on status, decode or match, retry transient failures, and
 * wrap raw transport/decode faults into vendor-tagged errors. It is generic
 * over the vendor's "extra" error union (`Extra`) so core never needs to know
 * the concrete WorkOS error types while still returning a precise channel.
 */
import type * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import type * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import type { SchemaError } from "effect/SchemaError";
import type * as Headers from "effect/unstable/http/Headers";
import type { HttpClient } from "effect/unstable/http/HttpClient";
import * as HttpClientError from "effect/unstable/http/HttpClientError";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import type * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import type { ClassifiedErrorClass } from "./errors.ts";
import {
  type InputSchema,
  isVoidOutput,
  type Operation,
  type OutputSchema,
  planRequest,
} from "./operation.ts";
import { apply, type RetryPolicy } from "./retry.ts";

// ---------------------------------------------------------------------------
// Error matching
// ---------------------------------------------------------------------------

/** Normalized view of a vendor error body. */
export interface ErrorEnvelope {
  /** Human-readable message. */
  readonly message: string;
  /** Discriminating code (`code` or OAuth `error`), when present. */
  readonly discriminator: string | undefined;
  /** The raw parsed body, for the `Unknown*` fallback. */
  readonly body: unknown;
}

/** Everything the generic matcher needs from a specific vendor. */
export interface MatchErrorConfig<Extra> {
  /** Extract message + discriminator from a parsed error body. */
  readonly decodeEnvelope: (body: unknown) => ErrorEnvelope;
  /** HTTP status → error class. */
  readonly statusErrors: Readonly<Record<number, ClassifiedErrorClass>>;
  /** Discriminator code → error class (takes precedence over status). */
  readonly codeErrors: Readonly<Record<string, ClassifiedErrorClass>>;
  /** Errors valid for every operation (401/429/5xx). */
  readonly universalErrors: readonly ClassifiedErrorClass[];
  /** Statuses whose class accepts a `retryAfter` hint. */
  readonly retryableStatuses: ReadonlySet<number>;
  /** Parse a `Retry-After` hint for a retryable status. */
  readonly retryAfterFor: (
    status: number,
    headers: Headers.Headers,
  ) => Duration.Duration | undefined;
  /** Build the vendor's fallback error for an unmatched response. */
  readonly makeUnknown: (info: {
    readonly status: number;
    readonly envelope: ErrorEnvelope;
  }) => Extra;
}

/**
 * A per-operation error matcher. Its failure channel is exactly the operation's
 * declared errors plus the vendor's `Extra` union — honest by construction.
 */
export type MatchError<Extra> = <EC extends readonly ClassifiedErrorClass[]>(
  status: number,
  body: unknown,
  headers: Headers.Headers,
  operationErrors: EC,
) => Effect.Effect<never, InstanceType<EC[number]> | Extra>;

export const makeMatchError =
  <Extra>(config: MatchErrorConfig<Extra>): MatchError<Extra> =>
  <EC extends readonly ClassifiedErrorClass[]>(
    status: number,
    body: unknown,
    headers: Headers.Headers,
    operationErrors: EC,
  ): Effect.Effect<never, InstanceType<EC[number]> | Extra> => {
    // Only construct a typed class the operation actually declares (or a
    // universal default); everything else becomes the vendor `Unknown*` error.
    // This is the one place the union is asserted: the runtime gates on class
    // identity, but `tsc` can't prove a constructed instance is in the union.
    const fail = (error: unknown) =>
      Effect.fail(error) as Effect.Effect<
        never,
        InstanceType<EC[number]> | Extra
      >;

    const allowed = (cls: ClassifiedErrorClass): boolean =>
      config.universalErrors.includes(cls) || operationErrors.includes(cls);

    const envelope = config.decodeEnvelope(body);

    // 1. Code-discriminated error wins over the raw status (e.g. a 429 that is
    //    a daily quota, or a 403 that is really `mfa_enrollment`).
    if (envelope.discriminator !== undefined) {
      const CodeClass = config.codeErrors[envelope.discriminator];
      if (CodeClass !== undefined && allowed(CodeClass)) {
        return fail(
          new CodeClass({
            message: envelope.message,
            code: envelope.discriminator,
          }),
        );
      }
    }

    // 2. Status-mapped error, with a `Retry-After` hint for retryable statuses.
    const StatusClass = config.statusErrors[status];
    if (StatusClass !== undefined && allowed(StatusClass)) {
      const retryAfter = config.retryableStatuses.has(status)
        ? config.retryAfterFor(status, headers)
        : undefined;
      return fail(
        new StatusClass(
          retryAfter !== undefined
            ? { message: envelope.message, retryAfter }
            : { message: envelope.message },
        ),
      );
    }

    // 3. Fallback — signals a spec gap to be patched.
    return fail(config.makeUnknown({ status, envelope }));
  };

// ---------------------------------------------------------------------------
// Request execution
// ---------------------------------------------------------------------------

/** Which half of the pipeline a schema failure occurred in. */
export type DecodePhase = "request-encode" | "response-decode";

/**
 * Secret-free summary of an HTTP client failure, safe to carry on a vendor
 * error. Never wrap the `HttpClientError` itself: its `reason` holds the full
 * request — encoded body and auth header included — so preserving it verbatim
 * would leak secrets through any logged error chain. Vendor error *messages*
 * are built from the structured parts here, never from the reason's formatted
 * free text.
 */
export interface TransportFailure {
  readonly reason: string;
  readonly method: string;
  readonly url: string;
  /**
   * Transport-authored detail (e.g. "socket reset"), when the reason carries
   * one. Authored by the transport layer, never from request payloads.
   */
  readonly description?: string | undefined;
}

/** Build a {@link TransportFailure} from a raw HTTP client error. */
export const summarizeHttpClientError = (
  error: HttpClientError.HttpClientError,
): TransportFailure => ({
  reason: error.reason._tag,
  method: error.reason.request.method,
  url: error.reason.request.url,
  description:
    "description" in error.reason &&
    typeof error.reason.description === "string"
      ? error.reason.description
      : undefined,
});

/** Everything the runner captures once, at layer-construction time. */
export interface RunnerDeps<Extra> {
  readonly http: HttpClient;
  readonly baseUrl: string;
  readonly apiKey: Redacted.Redacted<string>;
  readonly retry: RetryPolicy;
  readonly matchError: MatchError<Extra>;
  /** Wrap a raw transport fault into a vendor-tagged error. */
  readonly toTransport: (cause: HttpClientError.HttpClientError) => Extra;
  /**
   * Wrap a request-encode or response-decode failure into a vendor error.
   * `body` may contain secrets (a token-bearing response that failed on an
   * unrelated field) — implementations must not store it printably.
   */
  readonly toDecode: (
    phase: DecodePhase,
    body: unknown,
    cause: SchemaError,
  ) => Extra;
}

/**
 * Executes a declared {@link Operation} and returns its precise result/error
 * channel. `Extra` is the vendor's universal + fallback + transport + decode
 * error union.
 */
export type Runner<Extra> = <
  IS extends InputSchema,
  OS extends OutputSchema,
  EC extends readonly ClassifiedErrorClass[],
>(
  op: Operation<IS, OS, EC>,
  input: IS["Type"],
) => Effect.Effect<OS["Type"], InstanceType<EC[number]> | Extra, never>;

const readBody = (
  response: HttpClientResponse.HttpClientResponse,
): Effect.Effect<unknown, HttpClientError.HttpClientError> =>
  response.json.pipe(Effect.catch(() => response.text));

export const makeRunner =
  <Extra>(deps: RunnerDeps<Extra>): Runner<Extra> =>
  (op, input) => {
    type Out = (typeof op)["output"]["Type"];

    const attempt = Effect.gen(function* () {
      const wire = (yield* Schema.encodeUnknownEffect(op.input)(input).pipe(
        Effect.catchTag("SchemaError", (cause) =>
          Effect.fail(deps.toDecode("request-encode", input, cause)),
        ),
      )) as Record<string, unknown>;

      const plan = planRequest(op, wire);

      let request = HttpClientRequest.make(op.method)(
        deps.baseUrl + plan.path,
      ).pipe(
        HttpClientRequest.bearerToken(deps.apiKey),
        HttpClientRequest.acceptJson,
      );
      if (Object.keys(plan.query).length > 0) {
        request = HttpClientRequest.setUrlParams(request, plan.query);
      }
      if (plan.body !== undefined) {
        // The body is a plain record built from schema-encoded scalars, arrays,
        // and nested objects — always JSON-serializable, so the unsafe (sync)
        // encoder is honest here and keeps `HttpBodyError` out of the channel.
        request = HttpClientRequest.bodyJsonUnsafe(request, plan.body);
      }

      const response = yield* deps.http.execute(request);

      // Success is strictly 2xx. 3xx (and, from a non-fetch transport, 1xx —
      // fetch itself never surfaces informational responses) is neither
      // success nor a documented error-table entry, so it routes through the
      // matcher and surfaces as the vendor's Unknown fallback rather than a
      // bogus decode attempt.
      if (response.status < 200 || response.status >= 300) {
        const errorBody = yield* readBody(response);
        return yield* deps.matchError(
          response.status,
          errorBody,
          response.headers,
          op.errors,
        );
      }

      // Only a void-output operation resolves to undefined. A 204 on an
      // operation that declares a body is a contract violation and falls
      // through to decode, failing honestly instead of returning undefined.
      if (isVoidOutput(op)) {
        return undefined as Out;
      }

      const rawBody = yield* readBody(response);
      return yield* Schema.decodeUnknownEffect(op.output)(rawBody).pipe(
        Effect.catchTag("SchemaError", (cause) =>
          Effect.fail(deps.toDecode("response-decode", rawBody, cause)),
        ),
      );
    });

    // Raw transport failures stay raw through retry so `isTransient` can inspect
    // the `HttpClientError` reason (only genuine transport faults are retried);
    // the survivor is then wrapped into the vendor's transport error.
    return attempt.pipe(
      apply(deps.retry, op.retry),
      Effect.mapError((error) =>
        HttpClientError.isHttpClientError(error)
          ? deps.toTransport(error)
          : error,
      ),
      Effect.withSpan(op.id, {
        attributes: {
          "http.request.method": op.method,
          "url.template": op.pathTemplate,
        },
      }),
    );
  };
