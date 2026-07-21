/**
 * Probes: raw-request capture through the core seam, unconditional
 * auto-scrub, deterministic evidence files — and the experimental-context
 * machinery: Scope-managed setup, env/CLI params, placeholder
 * normalization, provenance.
 */
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as HttpClientModule from "effect/unstable/http/HttpClient";
import type * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import { afterAll, describe, expect, it } from "vitest";
import { defineEnv } from "../src/env.ts";
import {
  buildCapture,
  defineProbe,
  normalizeParams,
  runProbe,
  SCRUBBED,
  scrubValue,
} from "../src/probe.ts";
import { resource } from "../src/resource.ts";

const makeEnv = (source: Readonly<Record<string, string>>) =>
  defineEnv(
    {
      vendor: "workos",
      apiKeyVar: "FAKE_WORKOS_KEY",
      defaultBaseUrl: "https://api.workos.test",
      capabilities: {},
    },
    source,
  );

const env = makeEnv({ FAKE_WORKOS_KEY: "sk_probe_secret_123" });

/** Recording mock transport: every request is captured for assertions. */
const mockHttp = (
  handler: (request: HttpClientRequest.HttpClientRequest) => {
    status: number;
    body: unknown;
  },
) => {
  const requests: Array<HttpClientRequest.HttpClientRequest> = [];
  const layer = Layer.succeed(
    HttpClientModule.HttpClient,
    HttpClientModule.make((request) => {
      requests.push(request);
      const reply = handler(request);
      return Effect.succeed(
        HttpClientResponse.fromWeb(
          request,
          new Response(JSON.stringify(reply.body), {
            status: reply.status,
            headers: {
              "content-type": "application/json",
              "set-cookie": "wos-session=abc123",
              "x-request-id": "req_1",
            },
          }),
        ),
      );
    }),
  );
  return { layer, requests };
};

const replyLayer = (status: number, body: unknown) =>
  mockHttp(() => ({ status, body })).layer;

const probe = defineProbe({
  id: "organizations-get-missing",
  title: "404 error envelope for a missing organization",
  request: {
    method: "GET",
    pathTemplate: "/organizations/{id}",
    pathParams: { id: "org_definitely_missing" },
  },
});

describe("scrubValue", () => {
  it("scrubs secret-shaped keys recursively and secret values anywhere", () => {
    const scrubbed = scrubValue(
      {
        access_token: "jwt.here",
        nested: {
          client_secret: "shh",
          note: "prefix sk_probe_secret_123 suffix",
        },
        list: [{ password: "pw" }, "plain"],
        fine: "left alone",
      },
      [],
      ["sk_probe_secret_123"],
    );
    expect(scrubbed).toEqual({
      access_token: SCRUBBED,
      nested: { client_secret: SCRUBBED, note: SCRUBBED },
      list: [{ password: SCRUBBED }, "plain"],
      fine: "left alone",
    });
  });

  it("honors probe-specific extra scrub keys", () => {
    expect(
      scrubValue({ special_field: "hide me" }, ["special_field"], []),
    ).toEqual({ special_field: SCRUBBED });
  });
});

describe("normalizeParams", () => {
  it("replaces param values with <name> placeholders, longest value first", () => {
    const normalized = normalizeParams(
      {
        id: "org_123_extra",
        note: "created org_123 then org_123_extra",
        list: ["org_123"],
      },
      { short: "org_123", long: "org_123_extra" },
    );
    expect(normalized).toEqual({
      id: "<long>",
      note: "created <short> then <long>",
      list: ["<short>"],
    });
  });

  it("leaves pathologically short values alone", () => {
    expect(
      normalizeParams({ q: "2", note: "page 2 of results" }, { page: "2" }),
    ).toEqual({ q: "2", note: "page 2 of results" });
  });
});

describe("runProbe", () => {
  const tmpDirs: string[] = [];
  afterAll(async () => {
    await Promise.all(
      tmpDirs.map((dir) => fs.rm(dir, { recursive: true, force: true })),
    );
  });

  it("captures a non-2xx response as data with scrubbed headers", async () => {
    const result = await Effect.runPromise(
      runProbe(probe, { env }).pipe(
        Effect.provide(
          replyLayer(404, { message: "Not Found", code: "entity_not_found" }),
        ),
      ),
    );
    expect(result.evidencePath).toBeUndefined();
    expect(result.capture.probe).toBe("organizations-get-missing");
    expect(result.capture.vendor).toBe("workos");
    expect(result.capture.capturedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // A param-less probe records no context block.
    expect(result.capture.context).toBeUndefined();
    expect(result.capture.response.status).toBe(404);
    expect(result.capture.response.body).toEqual({
      message: "Not Found",
      code: "entity_not_found",
    });
    // Cookie header is secret-shaped: scrubbed. Neutral headers survive.
    expect(result.capture.response.headers["set-cookie"]).toBe(SCRUBBED);
    expect(result.capture.response.headers["content-type"]).toBe(
      "application/json",
    );
    // The API key value must never appear anywhere in a capture.
    expect(JSON.stringify(result.capture)).not.toContain("sk_probe_secret_123");
  });

  it("writes the evidence file under <dir>/<id>.json with sorted headers", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "harness-evidence-"));
    tmpDirs.push(dir);
    const result = await Effect.runPromise(
      runProbe(probe, { env, evidenceDir: dir }).pipe(
        Effect.provide(replyLayer(404, { message: "Not Found" })),
      ),
    );
    expect(result.evidencePath).toBe(
      path.join(dir, "organizations-get-missing.json"),
    );
    const written = JSON.parse(
      await fs.readFile(result.evidencePath!, "utf8"),
    ) as typeof result.capture;
    expect(written).toEqual(result.capture);
    const headerKeys = Object.keys(written.response.headers);
    expect(headerKeys).toEqual([...headerKeys].sort());
  });

  it("refuses to run without credentials, naming the env var", async () => {
    const bare = makeEnv({});
    const error = await Effect.runPromise(
      runProbe(probe, { env: bare }).pipe(
        Effect.provide(replyLayer(200, {})),
        Effect.flip,
      ),
    );
    expect(error._tag).toBe("ProbeError");
    expect(error.message).toContain("FAKE_WORKOS_KEY");
  });
});

describe("runProbe with setup", () => {
  const setupProbe = (events: string[]) =>
    defineProbe({
      id: "organizations-get-ok",
      title: "200 response shape for a created organization",
      setup: Effect.gen(function* () {
        const orgId = yield* resource(
          Effect.sync(() => {
            events.push("create");
            return "org_created_4242";
          }),
          (id) => Effect.sync(() => events.push(`destroy:${id}`)),
        );
        return { orgId };
      }),
      request: ({ orgId }) => ({
        method: "GET",
        pathTemplate: "/organizations/{id}",
        pathParams: { id: orgId },
      }),
    });

  it("runs setup → observation → teardown, in that order, in one Scope", async () => {
    const events: string[] = [];
    const { layer, requests } = mockHttp(() => {
      events.push("observe");
      return {
        status: 200,
        body: { object: "organization", id: "org_created_4242" },
      };
    });
    const result = await Effect.runPromise(
      runProbe(setupProbe(events), { env }).pipe(Effect.provide(layer)),
    );

    // Teardown fired after the observation and the capture were done.
    expect(events).toEqual(["create", "observe", "destroy:org_created_4242"]);
    // The wire saw the real created id...
    expect(requests[0]!.url).toBe(
      "https://api.workos.test/organizations/org_created_4242",
    );
    // ...while the capture carries the stable placeholder, everywhere.
    expect(result.capture.request.pathParams).toEqual({ id: "<orgId>" });
    expect(result.capture.response.body).toEqual({
      object: "organization",
      id: "<orgId>",
    });
    expect(JSON.stringify(result.capture)).not.toContain("org_created_4242");
    // Context provenance names the source, never the value.
    expect(result.capture.context).toEqual({ params: { orgId: "setup" } });
  });

  it("a setup failure tears down what was acquired and skips the observation", async () => {
    const events: string[] = [];
    const failing = defineProbe({
      id: "org-setup-fails",
      title: "never observes",
      setup: Effect.gen(function* () {
        yield* resource(
          Effect.sync(() => {
            events.push("create");
            return "org_1";
          }),
          (id) => Effect.sync(() => events.push(`destroy:${id}`)),
        );
        return yield* Effect.fail({ _tag: "Conflict", message: "no seat" });
      }),
      request: () => ({ method: "GET" as const, pathTemplate: "/never" }),
    });
    const { layer, requests } = mockHttp(() => ({ status: 200, body: {} }));
    const error = await Effect.runPromise(
      runProbe(failing, { env }).pipe(Effect.provide(layer), Effect.flip),
    );

    expect(error._tag).toBe("ProbeError");
    expect(error.message).toContain('probe "org-setup-fails" setup failed');
    expect(error.message).toContain("Conflict: no seat");
    // The acquired resource still tore down; the wire was never touched.
    expect(events).toEqual(["create", "destroy:org_1"]);
    expect(requests).toHaveLength(0);
  });
});

describe("runProbe with env/CLI params", () => {
  const flagProbe = defineProbe({
    id: "flags-get-seeded",
    title: "seeded feature flag payload",
    envParams: { flagId: "WORKOS_SEEDED_FLAG_ID" },
    request: (params) => ({
      method: "GET",
      pathTemplate: "/flags/{id}",
      pathParams: { id: params.flagId },
    }),
  });

  it("resolves a declared param from the env, with provenance and normalization", async () => {
    const seeded = makeEnv({
      FAKE_WORKOS_KEY: "sk_probe_secret_123",
      WORKOS_SEEDED_FLAG_ID: "flag_dash_8888",
    });
    const { layer, requests } = mockHttp(() => ({
      status: 200,
      body: { id: "flag_dash_8888", enabled: true },
    }));
    const result = await Effect.runPromise(
      runProbe(flagProbe, { env: seeded }).pipe(Effect.provide(layer)),
    );
    expect(requests[0]!.url).toBe(
      "https://api.workos.test/flags/flag_dash_8888",
    );
    // The seeded id is workspace state: never in checked-in evidence.
    expect(JSON.stringify(result.capture)).not.toContain("flag_dash_8888");
    expect(result.capture.request.pathParams).toEqual({ id: "<flagId>" });
    expect(result.capture.context).toEqual({
      params: { flagId: "env:WORKOS_SEEDED_FLAG_ID" },
    });
  });

  it("refuses with every unresolved param named — var and --param hint", async () => {
    const error = await Effect.runPromise(
      runProbe(flagProbe, { env }).pipe(
        Effect.provide(replyLayer(200, {})),
        Effect.flip,
      ),
    );
    expect(error._tag).toBe("ProbeError");
    expect(error.message).toContain('"flagId"');
    expect(error.message).toContain("WORKOS_SEEDED_FLAG_ID");
    expect(error.message).toContain("--param flagId=");
  });

  it("an operator --param overrides the env value and is recorded as cli", async () => {
    const seeded = makeEnv({
      FAKE_WORKOS_KEY: "sk_probe_secret_123",
      WORKOS_SEEDED_FLAG_ID: "flag_dash_8888",
    });
    const { layer, requests } = mockHttp(() => ({ status: 200, body: {} }));
    const result = await Effect.runPromise(
      runProbe(flagProbe, {
        env: seeded,
        params: { flagId: "flag_override_7777" },
      }).pipe(Effect.provide(layer)),
    );
    expect(requests[0]!.url).toBe(
      "https://api.workos.test/flags/flag_override_7777",
    );
    expect(result.capture.request.pathParams).toEqual({ id: "<flagId>" });
    expect(result.capture.context).toEqual({ params: { flagId: "cli" } });
  });
});

describe("buildCapture", () => {
  it("scrubs request bodies including probe-declared extra keys", () => {
    const capture = buildCapture({
      id: "auth-bad-password",
      title: "invalid_credentials envelope",
      vendor: "workos",
      request: {
        method: "POST",
        pathTemplate: "/user_management/authenticate",
        body: {
          kind: "json",
          value: { email: "probe@example.com", password: "pw", magic: "m" },
        },
      },
      response: {
        status: 400,
        headers: {},
        body: { code: "invalid_credentials" },
      },
      scrubKeys: ["magic"],
      secretValues: [],
      capturedAt: "2026-07-20",
    });
    expect(capture.request.body).toEqual({
      email: "probe@example.com",
      password: SCRUBBED,
      magic: SCRUBBED,
    });
    expect(capture.context).toBeUndefined();
  });
});
