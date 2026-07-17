/**
 * Unit-level contract tests: the whole request pipeline (encode → plan →
 * execute → status branch → decode / match) driven against a mock transport.
 * No network, no credentials required.
 */
import { Retry } from "@hourglass-financial/api-factory-core";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Stream from "effect/Stream";
import * as HttpClientModule from "effect/unstable/http/HttpClient";
import type * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import * as UrlParams from "effect/unstable/http/UrlParams";
import { describe, expect, it } from "vitest";
import { layerWith, type WorkosClient } from "../src/client.ts";
import { credentialsOf } from "../src/config.ts";
import * as organizations from "../src/resources/organizations.ts";
import * as userManagement from "../src/resources/user-management.ts";

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
  handler: (request: HttpClientRequest.HttpClientRequest) => MockReply,
) => {
  const requests: Array<HttpClientRequest.HttpClientRequest> = [];
  const mock = HttpClientModule.make((request) => {
    requests.push(request);
    const reply = handler(request);
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
  const layer = layerWith({ retry: Retry.disabled }).pipe(
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

  it("remove — treats a 200 empty body as void success", async () => {
    const { run } = harness(() => ({ status: 200 }));
    const result = await run(organizations.remove({ id: "org_123" }));
    expect(result).toBeUndefined();
  });

  it("list — serializes query params and follows the cursor via listItems", async () => {
    const { run, requests } = harness((request) => {
      const params = UrlParams.toRecord(request.urlParams);
      const after = params.after;
      if (after === undefined) {
        return {
          status: 200,
          body: {
            object: "list",
            data: [{ ...organizationBody, id: "org_1" }],
            list_metadata: { before: null, after: "cur_1" },
          },
        };
      }
      return {
        status: 200,
        body: {
          object: "list",
          data: [{ ...organizationBody, id: "org_2" }],
          list_metadata: { before: null, after: null },
        },
      };
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
      body: { code: "radar_challenge", message: "challenge" },
    }));
    const error = await run(
      userManagement.authenticateWithPassword(authInput).pipe(Effect.flip),
    );
    expect(error._tag).toBe("UnknownWorkosError");
  });
});
