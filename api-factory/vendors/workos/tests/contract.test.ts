/**
 * Contract tests: the whole request pipeline (encode → plan → execute → status
 * branch → decode / match) driven against a mock transport through the
 * client's public surface. No network, no credentials required.
 *
 * These are agent-writable (they live in `vendors/`, not the machine-owned
 * `clients/` tree) and exercise the behavior the generated client must
 * preserve across regenerations.
 */
import { Retry } from "@hourglass-financial/api-factory-core";
import {
  credentialsOf,
  layerWith,
  organizations,
  userManagement,
  type WorkosClient,
  type WorkosClientOptions,
  type WorkosDecodeError,
  type WorkosTransportError,
} from "@hourglass-financial/api-factory-workos";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Stream from "effect/Stream";
import * as HttpClientModule from "effect/unstable/http/HttpClient";
import * as HttpClientError from "effect/unstable/http/HttpClientError";
import type * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import * as UrlParams from "effect/unstable/http/UrlParams";
import { describe, expect, it } from "vitest";

interface MockReply {
  readonly status: number;
  readonly body?: unknown;
  readonly headers?: Record<string, string>;
}

const requestBodyJson = (
  request: HttpClientRequest.HttpClientRequest,
): unknown => {
  const body = request.body;
  if (body._tag === "Uint8Array") {
    return JSON.parse(new TextDecoder().decode(body.body));
  }
  return undefined;
};

const harness = (
  handler: (
    request: HttpClientRequest.HttpClientRequest,
    index: number,
  ) => MockReply,
  options: WorkosClientOptions = { retry: Retry.disabled },
) => {
  const requests: Array<HttpClientRequest.HttpClientRequest> = [];
  const mock = HttpClientModule.make((request) => {
    requests.push(request);
    const reply = handler(request, requests.length - 1);
    const payload =
      reply.body === undefined ? null : JSON.stringify(reply.body);
    return Effect.succeed(
      HttpClientResponse.fromWeb(
        request,
        new Response(payload, {
          status: reply.status,
          headers: { "content-type": "application/json", ...reply.headers },
        }),
      ),
    );
  });
  const layer = layerWith(options).pipe(
    Layer.provide(Layer.succeed(HttpClientModule.HttpClient, mock)),
    Layer.provide(
      credentialsOf({
        apiKey: Redacted.make("sk_test_123"),
        baseUrl: "https://api.workos.test",
      }),
    ),
  );
  const run = <A, E>(program: Effect.Effect<A, E, WorkosClient>): Promise<A> =>
    Effect.runPromise(program.pipe(Effect.provide(layer)));
  return { run, requests };
};

const organizationBody = {
  object: "organization",
  id: "org_123",
  name: "Acme",
  domains: [],
  metadata: {},
  external_id: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const listPage = (id: string, after: string | null): MockReply["body"] => ({
  object: "list",
  data: [{ ...organizationBody, id }],
  list_metadata: { before: null, after },
});

describe("organizations", () => {
  it("create — POSTs to /organizations with bearer auth and decodes the org", async () => {
    const { run, requests } = harness(() => ({
      status: 201,
      body: organizationBody,
    }));
    const org = await run(organizations.create({ name: "Acme" }));

    expect(org.id).toBe("org_123");
    expect(org.name).toBe("Acme");
    const request = requests[0]!;
    expect(request.method).toBe("POST");
    expect(request.url).toBe("https://api.workos.test/organizations");
    expect(request.headers.authorization).toBe("Bearer sk_test_123");
    expect(requestBodyJson(request)).toEqual({ name: "Acme" });
  });

  it("get — substitutes the path param", async () => {
    const { run, requests } = harness(() => ({
      status: 200,
      body: organizationBody,
    }));
    await run(organizations.get({ id: "org_123" }));
    expect(requests[0]!.url).toBe(
      "https://api.workos.test/organizations/org_123",
    );
  });

  it("get — maps a 404 to a typed NotFound", async () => {
    const { run } = harness(() => ({
      status: 404,
      body: { message: "Organization not found" },
    }));
    const error = await run(
      organizations.get({ id: "missing" }).pipe(Effect.flip),
    );
    expect(error._tag).toBe("NotFound");
  });

  it("delete — treats a 200 empty body as void success", async () => {
    const { run } = harness(() => ({ status: 200 }));
    const result = await run(organizations.delete({ id: "org_123" }));
    expect(result).toBeUndefined();
  });

  it("get — a 204 on a body-declaring operation fails honestly, not undefined", async () => {
    const { run } = harness(() => ({ status: 204 }));
    const error = await run(
      organizations.get({ id: "org_123" }).pipe(Effect.flip),
    );
    expect(error._tag).toBe("WorkosDecodeError");
  });

  it("get — a redirect is not success: 302 falls back to UnknownWorkosError", async () => {
    const { run } = harness(() => ({
      status: 302,
      body: { message: "moved" },
    }));
    const error = await run(
      organizations.get({ id: "org_123" }).pipe(Effect.flip),
    );
    expect(error._tag).toBe("UnknownWorkosError");
  });

  it("list — serializes query params and follows the cursor via listItems", async () => {
    const { run, requests } = harness((request) => {
      const params = UrlParams.toRecord(request.urlParams);
      return params.after === undefined
        ? { status: 200, body: listPage("org_1", "cur_1") }
        : { status: 200, body: listPage("org_2", null) };
    });
    const all = await run(
      Stream.runCollect(organizations.listItems({ limit: 1 })),
    );
    expect(all.map((o) => o.id)).toEqual(["org_1", "org_2"]);
    // First page sends limit only; second page adds the cursor.
    expect(UrlParams.toRecord(requests[0]!.urlParams)).toEqual({ limit: "1" });
    expect(UrlParams.toRecord(requests[1]!.urlParams)).toEqual({
      limit: "1",
      after: "cur_1",
    });
  });

  it("list — a caller-supplied `before` scopes only the first request", async () => {
    const { run, requests } = harness((_request, index) =>
      index === 0
        ? { status: 200, body: listPage("org_1", "cur_1") }
        : { status: 200, body: listPage("org_2", null) },
    );
    await run(Stream.runCollect(organizations.listItems({ before: "cur_b" })));
    // The walk starts from the caller's `before` window...
    expect(UrlParams.toRecord(requests[0]!.urlParams)).toEqual({
      before: "cur_b",
    });
    // ...but once the forward cursor advances, `before` is dropped rather than
    // sending both directions at once.
    expect(UrlParams.toRecord(requests[1]!.urlParams)).toEqual({
      after: "cur_1",
    });
  });
});

describe("retry disposition", () => {
  const flaky = (index: number): MockReply =>
    index === 0
      ? { status: 503, body: { message: "unavailable" } }
      : { status: 200, body: organizationBody };

  it("an idempotent GET retries a transient 503 under the default policy", async () => {
    const { run, requests } = harness((_request, index) => flaky(index), {});
    const org = await run(organizations.get({ id: "org_123" }));
    expect(org.id).toBe("org_123");
    expect(requests.length).toBe(2);
  });

  it("a mutating POST does not retry a transient 503 — only throttling", async () => {
    const { run, requests } = harness((_request, index) => flaky(index), {});
    const error = await run(
      organizations.create({ name: "Acme" }).pipe(Effect.flip),
    );
    expect(error._tag).toBe("ServiceUnavailable");
    expect(requests.length).toBe(1);
  });
});

describe("userManagement.authenticateWithPassword", () => {
  const authInput = {
    client_id: "client_123",
    client_secret: Redacted.make("sk_secret"),
    email: "user@example.com",
    password: Redacted.make("s3cret-password"),
  };

  it("unwraps redacted secrets onto the wire and redacts response tokens", async () => {
    const { run, requests } = harness(() => ({
      status: 200,
      body: {
        user: {
          object: "user",
          id: "user_1",
          first_name: null,
          last_name: null,
          profile_picture_url: null,
          email: "user@example.com",
          email_verified: true,
          external_id: null,
          last_sign_in_at: null,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        access_token: "access.jwt.value",
        refresh_token: "refresh.token.value",
        authentication_method: "Password",
      },
    }));

    const result = await run(
      userManagement.authenticateWithPassword(authInput),
    );

    // Response tokens are redacted...
    expect(Redacted.isRedacted(result.access_token)).toBe(true);
    expect(Redacted.value(result.access_token)).toBe("access.jwt.value");
    expect(JSON.stringify(result)).not.toContain("access.jwt.value");

    // ...but the request body carried the real secrets and the constant grant.
    const body = requestBodyJson(requests[0]!) as Record<string, unknown>;
    expect(body.grant_type).toBe("password");
    expect(body.client_secret).toBe("sk_secret");
    expect(body.password).toBe("s3cret-password");
  });

  it("maps a 400 invalid_credentials code to a distinct typed error", async () => {
    const { run } = harness(() => ({
      status: 400,
      body: { code: "invalid_credentials", message: "Bad credentials" },
    }));
    const error = await run(
      userManagement.authenticateWithPassword(authInput).pipe(Effect.flip),
    );
    expect(error._tag).toBe("InvalidCredentials");
  });

  it("maps a 403 mfa_enrollment code to MfaEnrollment (not a generic Forbidden)", async () => {
    const { run } = harness(() => ({
      status: 403,
      body: { code: "mfa_enrollment", message: "MFA required" },
    }));
    const error = await run(
      userManagement.authenticateWithPassword(authInput).pipe(Effect.flip),
    );
    expect(error._tag).toBe("MfaEnrollment");
  });

  it("maps an OAuth-style 400 { error } envelope to InvalidGrant", async () => {
    const { run } = harness(() => ({
      status: 400,
      body: {
        error: "invalid_grant",
        error_description: "The request failed due to: invalid_grant.",
      },
    }));
    const error = await run(
      userManagement.authenticateWithPassword(authInput).pipe(Effect.flip),
    );
    expect(error._tag).toBe("InvalidGrant");
  });

  it("falls back to UnknownWorkosError for an unmodeled code", async () => {
    const { run } = harness(() => ({
      status: 403,
      body: { code: "passkey_progressive_enrollment", message: "challenge" },
    }));
    const error = await run(
      userManagement.authenticateWithPassword(authInput).pipe(Effect.flip),
    );
    expect(error._tag).toBe("UnknownWorkosError");
  });

  it("a decode failure keeps the token-bearing body redacted — tokens never print", async () => {
    // Valid tokens, malformed `user`: the exact spec-drift scenario the SDK
    // exists to surface must not itself leak the credentials.
    const { run } = harness(() => ({
      status: 200,
      body: {
        user: { object: "user" },
        access_token: "leaky.jwt.token",
        refresh_token: "leaky.refresh.token",
      },
    }));
    const error = await run(
      userManagement.authenticateWithPassword(authInput).pipe(Effect.flip),
    );
    expect(error._tag).toBe("WorkosDecodeError");
    const decodeError = error as WorkosDecodeError;
    expect(Redacted.isRedacted(decodeError.body)).toBe(true);
    const printed = JSON.stringify(decodeError);
    expect(printed).not.toContain("leaky.jwt.token");
    expect(printed).not.toContain("leaky.refresh.token");
    // ...while the raw body stays reachable for deliberate diagnosis.
    expect(JSON.stringify(Redacted.value(decodeError.body!))).toContain(
      "leaky.jwt.token",
    );
  });

  it("a transport failure carries no secrets in its error chain", async () => {
    const failing = HttpClientModule.make((request) =>
      Effect.fail(
        new HttpClientError.HttpClientError({
          reason: new HttpClientError.TransportError({
            request,
            description: "socket reset",
          }),
        }),
      ),
    );
    const layer = layerWith({ retry: Retry.disabled }).pipe(
      Layer.provide(Layer.succeed(HttpClientModule.HttpClient, failing)),
      Layer.provide(
        credentialsOf({
          apiKey: Redacted.make("sk_test_123"),
          baseUrl: "https://api.workos.test",
        }),
      ),
    );
    const error = await Effect.runPromise(
      userManagement
        .authenticateWithPassword(authInput)
        .pipe(Effect.flip, Effect.provide(layer)),
    );
    expect(error._tag).toBe("WorkosTransportError");
    const transportError = error as WorkosTransportError;
    // The cause is the secret-free summary, not the raw request-bearing error.
    expect(transportError.cause).toMatchObject({
      reason: "TransportError",
      method: "POST",
    });
    const printed = JSON.stringify(transportError);
    expect(printed).not.toContain("s3cret-password");
    expect(printed).not.toContain("sk_secret");
    expect(printed).not.toContain("sk_test_123");
  });
});
