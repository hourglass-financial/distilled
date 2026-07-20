/**
 * `rawRequest()` — the sanctioned way to hit an API off the typed operation
 * surface (#30, decision 8). Probes and negative tests need to send requests
 * no generated operation can express: undocumented endpoints, deliberately
 * malformed bodies, extra headers. They must NOT do it with plain `fetch`,
 * which would lose `Redacted` secret handling and re-implement auth.
 *
 * This primitive shares the planner's own path/query serialization
 * (`planRequest`) and the runner's request assembly (`assembleRequest`) —
 * one implementation of auth, zero drift by construction. What it deliberately
 * omits is the typed half of the pipeline: no input encode, no output decode,
 * no error matching.
 *
 * Non-2xx is data, not an error: the caller gets `{ status, headers, body }`
 * whatever the status, because a probe's whole purpose is usually to observe
 * an error response. Only transport failure occupies the error channel, as a
 * secret-free {@link RawTransportError}. Retry is off by default — a probe
 * wants the wire's first answer.
 */
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import type { HttpClient } from "effect/unstable/http/HttpClient";
import * as HttpClientError from "effect/unstable/http/HttpClientError";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import { Meta, MetaKey } from "./category.ts";
import type { HttpMethod, RequestSpec } from "./operation.ts";
import { planRequest } from "./operation.ts";
import type { RetryPolicy } from "./retry.ts";
import {
  assembleRequest,
  type AuthDeps,
  readBody,
  summarizeHttpClientError,
  type TransportFailure,
} from "./transport.ts";

const isTransportFailure = (value: unknown): value is TransportFailure =>
  typeof value === "object" &&
  value !== null &&
  "reason" in value &&
  "method" in value &&
  "url" in value;

/**
 * Wire-level failure of a raw request. Carries only the secret-free
 * {@link TransportFailure} summary — never the raw `HttpClientError`, whose
 * `reason` embeds the full request including the auth header.
 */
export class RawTransportError extends Schema.TaggedErrorClass<RawTransportError>()(
  "RawTransportError",
  {
    message: Schema.String,
    cause: Schema.declare(isTransportFailure),
  },
) {
  readonly [MetaKey] = Meta.transport;
}

/**
 * Everything `makeRawRequest` captures once: the same transport + credential
 * slice the operation runner captures, minus the typed-pipeline dependencies.
 */
export interface RawRequestDeps extends AuthDeps {
  readonly http: HttpClient;
}

/** Body of a raw request. */
export type RawRequestBody =
  /** JSON-serialized value — the ordinary case. */
  | { readonly kind: "json"; readonly value: unknown }
  /**
   * Verbatim text bytes — the negative-test escape hatch (#29): malformed
   * JSON, wrong content types, truncated payloads.
   */
  | { readonly kind: "text"; readonly value: string; readonly contentType?: string };

/** Query parameter values, serialized exactly like operation query params. */
export type RawQueryValue =
  | string
  | number
  | boolean
  | ReadonlyArray<string | number | boolean>;

/** A single raw request. */
export interface RawRequestOptions {
  readonly method: HttpMethod;
  /** Path template with `{param}` placeholders, e.g. `/organizations/{id}`. */
  readonly pathTemplate: string;
  /** Values substituted (URL-encoded) into the template's placeholders. */
  readonly pathParams?: Readonly<Record<string, string>>;
  /** Query parameters; arrays comma-join, `undefined` entries drop. */
  readonly query?: Readonly<Record<string, RawQueryValue | undefined>>;
  /** Extra headers merged over the assembled defaults. */
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: RawRequestBody;
  /**
   * Opt-in retry of *transport faults only* (never of non-2xx responses,
   * which are data here). Default: no retry.
   */
  readonly retry?: RetryPolicy;
}

/** What came back — whatever the status. */
export interface RawResponse {
  readonly status: number;
  /** Response headers as a plain record (header names lower-cased). */
  readonly headers: Readonly<Record<string, string>>;
  /** JSON-parsed body when parseable, otherwise the raw text. */
  readonly body: unknown;
}

/** A configured raw-request function. */
export type RawRequest = (
  options: RawRequestOptions,
) => Effect.Effect<RawResponse, RawTransportError>;

const headersToRecord = (
  headers: object,
): Readonly<Record<string, string>> => {
  const record: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === "string") record[key] = value;
  }
  return record;
};

/**
 * Build a {@link RawRequest} over the shared transport seam. The `path` +
 * `query` serialization is literally `planRequest` — the descriptor is
 * synthesized from the options, with every provided key bound as a path or
 * query param and the body attached verbatim afterwards.
 */
export const makeRawRequest =
  (deps: RawRequestDeps): RawRequest =>
  (options) => {
    const spec: RequestSpec = {
      method: options.method,
      pathTemplate: options.pathTemplate,
      pathParams: Object.keys(options.pathParams ?? {}),
      queryParams: Object.keys(options.query ?? {}),
    };
    const wire: Record<string, unknown> = {
      ...options.pathParams,
      ...options.query,
    };

    const attempt = Effect.gen(function* () {
      const plan = planRequest(spec, wire);
      let request = assembleRequest(deps, options.method, plan);
      if (options.headers !== undefined) {
        request = HttpClientRequest.setHeaders(request, options.headers);
      }
      if (options.body !== undefined) {
        request =
          options.body.kind === "json"
            ? HttpClientRequest.bodyJsonUnsafe(request, options.body.value)
            : HttpClientRequest.bodyText(
                request,
                options.body.value,
                options.body.contentType ?? "application/json",
              );
      }
      const response = yield* deps.http.execute(request);
      const body = yield* readBody(response);
      return {
        status: response.status,
        headers: headersToRecord(response.headers),
        body,
      } satisfies RawResponse;
    });

    // Raw transport faults stay raw through the (opt-in) retry so the policy
    // predicate can inspect them, mirroring the runner; the survivor is then
    // summarized into the secret-free error.
    const retried =
      options.retry?.schedule === undefined
        ? attempt
        : Effect.retry(attempt, {
            while: (error) =>
              HttpClientError.isHttpClientError(error) &&
              options.retry!.while(error),
            schedule: options.retry.schedule,
          });

    return retried.pipe(
      Effect.mapError((error) => {
        const failure = summarizeHttpClientError(error);
        return new RawTransportError({
          message: `raw request transport failure (${failure.method} ${failure.url}: ${failure.reason})`,
          cause: failure,
        });
      }),
      Effect.withSpan("rawRequest", {
        attributes: {
          "http.request.method": options.method,
          "url.template": options.pathTemplate,
        },
      }),
    );
  };
