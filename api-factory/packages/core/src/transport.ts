/**
 * The one request-assembly and response-reading seam shared by the operation
 * runner (`makeRunner`) and the raw-request primitive (`makeRawRequest`).
 *
 * Auth, base-URL joining, accept headers, and query attachment live here —
 * exactly once — so a probe issued through `rawRequest()` exercises the same
 * wire path as a generated operation. A second, probe-only implementation of
 * auth was rejected in #30 (decision 8): it would have to track every vendor
 * scheme and would drift silently.
 */
import * as Effect from "effect/Effect";
import type * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import type * as HttpClientError from "effect/unstable/http/HttpClientError";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import type * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import type { HttpMethod, RequestPlan } from "./operation.ts";

/**
 * The credential + endpoint slice of the runner's dependencies — everything
 * request assembly needs, nothing more.
 */
export interface AuthDeps {
  readonly baseUrl: string;
  readonly apiKey: Redacted.Redacted<string>;
}

/**
 * Assemble the authenticated request skeleton from a {@link RequestPlan}:
 * base URL + path, bearer auth (the key stays `Redacted` until the transport
 * unwraps it), JSON accept header, and query parameters. Body attachment is
 * the caller's job — the runner encodes through the operation's schema, the
 * raw primitive passes bytes through verbatim.
 */
export const assembleRequest = (
  deps: AuthDeps,
  method: HttpMethod,
  plan: RequestPlan,
): HttpClientRequest.HttpClientRequest => {
  let request = HttpClientRequest.make(method)(deps.baseUrl + plan.path).pipe(
    HttpClientRequest.bearerToken(deps.apiKey),
    HttpClientRequest.acceptJson,
  );
  if (Object.keys(plan.query).length > 0) {
    request = HttpClientRequest.setUrlParams(request, plan.query);
  }
  return request;
};

/**
 * Read a response body as JSON, falling back to text for non-JSON payloads
 * (HTML error pages, empty bodies).
 */
export const readBody = (
  response: HttpClientResponse.HttpClientResponse,
): Effect.Effect<unknown, HttpClientError.HttpClientError> =>
  response.json.pipe(Effect.catch(() => response.text));

/**
 * Secret-free summary of an HTTP client failure, safe to carry on a vendor
 * error. Never wrap the `HttpClientError` itself: its `reason` holds the full
 * request — encoded body and auth header included — so preserving it verbatim
 * would leak secrets through any logged error chain. Vendor error *messages*
 * are built from the structured parts here, never from the reason's formatted
 * free text.
 *
 * Defined schema-first (the value doubles as the type): error classes embed
 * it as a field directly, and construction flows through the schema's own
 * `make` — no hand-written guard to drift from the shape. `description` is
 * transport-authored detail (e.g. "socket reset"), never request payload.
 */
export const TransportFailure = Schema.Struct({
  reason: Schema.String,
  method: Schema.String,
  url: Schema.String,
  description: Schema.optional(Schema.String),
});
export type TransportFailure = typeof TransportFailure.Type;

/** Build a {@link TransportFailure} from a raw HTTP client error. */
export const summarizeHttpClientError = (
  error: HttpClientError.HttpClientError,
): TransportFailure =>
  TransportFailure.make({
    reason: error.reason._tag,
    method: error.reason.request.method,
    url: error.reason.request.url,
    description:
      "description" in error.reason &&
      typeof error.reason.description === "string"
        ? error.reason.description
        : undefined,
  });
