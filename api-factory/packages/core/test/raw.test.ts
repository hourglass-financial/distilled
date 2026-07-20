/**
 * `makeRawRequest` — the probe/negative-test primitive. These tests drive it
 * against a mock transport and pin the two load-bearing properties: it shares
 * the planner's request assembly (auth, path, query serialization), and
 * non-2xx responses are data while only transport failure errors.
 */
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schedule from "effect/Schedule";
import * as HttpClientModule from "effect/unstable/http/HttpClient";
import * as HttpClientError from "effect/unstable/http/HttpClientError";
import type * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import * as UrlParams from "effect/unstable/http/UrlParams";
import { describe, expect, it } from "vitest";
import { makeRawRequest, type RawRequestOptions } from "../src/raw.ts";

interface MockReply {
  readonly status: number;
  readonly body?: string;
  readonly contentType?: string;
}

const mockRaw = (
  handler: (
    request: HttpClientRequest.HttpClientRequest,
    index: number,
  ) => MockReply | HttpClientError.HttpClientError,
) => {
  const requests: Array<HttpClientRequest.HttpClientRequest> = [];
  const http = HttpClientModule.make((request) => {
    requests.push(request);
    const reply = handler(request, requests.length - 1);
    if (HttpClientError.isHttpClientError(reply)) return Effect.fail(reply);
    return Effect.succeed(
      HttpClientResponse.fromWeb(
        request,
        new Response(reply.body ?? null, {
          status: reply.status,
          headers: {
            "content-type": reply.contentType ?? "application/json",
          },
        }),
      ),
    );
  });
  const rawRequest = makeRawRequest({
    http,
    baseUrl: "https://api.vendor.test",
    apiKey: Redacted.make("sk_raw_test_secret"),
  });
  const run = (options: RawRequestOptions) =>
    Effect.runPromise(rawRequest(options));
  return { rawRequest, run, requests };
};

const requestBodyText = (
  request: HttpClientRequest.HttpClientRequest,
): string | undefined => {
  const body = request.body;
  return body._tag === "Uint8Array"
    ? new TextDecoder().decode(body.body)
    : undefined;
};

describe("makeRawRequest", () => {
  it("assembles the request like the runner: bearer auth, accept, path + query serialization", async () => {
    const { run, requests } = mockRaw(() => ({ status: 200, body: "{}" }));
    await run({
      method: "GET",
      pathTemplate: "/organizations/{id}/members",
      pathParams: { id: "org 123" },
      query: { limit: 5, domains: ["a.com", "b.com"], missing: undefined },
    });

    const request = requests[0]!;
    expect(request.method).toBe("GET");
    expect(request.url).toBe(
      "https://api.vendor.test/organizations/org%20123/members",
    );
    expect(request.headers.authorization).toBe("Bearer sk_raw_test_secret");
    expect(request.headers.accept).toBe("application/json");
    // Arrays comma-join and undefined drops — the planner's convention.
    expect(UrlParams.toRecord(request.urlParams)).toEqual({
      limit: "5",
      domains: "a.com,b.com",
    });
  });

  it("non-2xx is data: a 404 resolves with status, headers, and parsed body", async () => {
    const { run } = mockRaw(() => ({
      status: 404,
      body: JSON.stringify({ message: "Not Found", code: "entity_not_found" }),
    }));
    const response = await run({
      method: "GET",
      pathTemplate: "/organizations/{id}",
      pathParams: { id: "org_missing" },
    });
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Not Found",
      code: "entity_not_found",
    });
    expect(response.headers["content-type"]).toBe("application/json");
  });

  it("a non-JSON response body falls back to text", async () => {
    const { run } = mockRaw(() => ({
      status: 503,
      body: "<html>upstream unavailable</html>",
      contentType: "text/html",
    }));
    const response = await run({ method: "GET", pathTemplate: "/status" });
    expect(response.status).toBe(503);
    expect(response.body).toBe("<html>upstream unavailable</html>");
  });

  it("sends a JSON body and merges extra headers over the defaults", async () => {
    const { run, requests } = mockRaw(() => ({ status: 201, body: "{}" }));
    await run({
      method: "POST",
      pathTemplate: "/organizations",
      headers: { "idempotency-key": "key_1" },
      body: { kind: "json", value: { name: "Acme" } },
    });
    const request = requests[0]!;
    expect(request.headers["idempotency-key"]).toBe("key_1");
    expect(JSON.parse(requestBodyText(request)!)).toEqual({ name: "Acme" });
  });

  it("sends a verbatim text body — the malformed-JSON negative-test path", async () => {
    const { run, requests } = mockRaw(() => ({ status: 400, body: "{}" }));
    const response = await run({
      method: "POST",
      pathTemplate: "/organizations",
      body: { kind: "text", value: '{"name": tru', contentType: "application/json" },
    });
    expect(response.status).toBe(400);
    expect(requestBodyText(requests[0]!)).toBe('{"name": tru');
  });

  it("transport failure is the only error — typed, secret-free, no retry by default", async () => {
    const { rawRequest, requests } = mockRaw(
      (request) =>
        new HttpClientError.HttpClientError({
          reason: new HttpClientError.TransportError({
            request,
            description: "socket reset",
          }),
        }),
    );
    const error = await Effect.runPromise(
      Effect.flip(rawRequest({ method: "GET", pathTemplate: "/status" })),
    );

    expect(error._tag).toBe("RawTransportError");
    expect(error.cause).toMatchObject({
      reason: "TransportError",
      method: "GET",
      url: "https://api.vendor.test/status",
      description: "socket reset",
    });
    // Secret-free: the API key never reaches the error's printable surface.
    expect(JSON.stringify(error)).not.toContain("sk_raw_test_secret");
    // Retry is off by default — the wire was hit exactly once.
    expect(requests.length).toBe(1);
  });

  it("opt-in retry retries transport faults but never non-2xx responses", async () => {
    const flaky = mockRaw((request, index) =>
      index === 0
        ? new HttpClientError.HttpClientError({
            reason: new HttpClientError.TransportError({
              request,
              description: "socket reset",
            }),
          })
        : { status: 200, body: "{}" },
    );
    const retry = {
      while: () => true,
      schedule: Schedule.spaced(Duration.millis(1)).pipe(
        Schedule.upTo({ times: 3 }),
      ),
    };
    const recovered = await flaky.run({
      method: "GET",
      pathTemplate: "/status",
      retry,
    });
    expect(recovered.status).toBe(200);
    expect(flaky.requests.length).toBe(2);

    // A 500 is data, not a retryable failure: one request, resolved as data.
    const erroring = mockRaw(() => ({ status: 500, body: "{}" }));
    const response = await erroring.run({
      method: "GET",
      pathTemplate: "/status",
      retry,
    });
    expect(response.status).toBe(500);
    expect(erroring.requests.length).toBe(1);
  });
});
