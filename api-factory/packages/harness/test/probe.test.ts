/**
 * Probes: raw-request capture through the core seam, unconditional
 * auto-scrub, deterministic evidence files.
 */
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as HttpClientModule from "effect/unstable/http/HttpClient";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import { afterAll, describe, expect, it } from "vitest";
import { defineEnv } from "../src/env.ts";
import {
  buildCapture,
  defineProbe,
  runProbe,
  SCRUBBED,
  scrubValue,
} from "../src/probe.ts";

const env = defineEnv(
  {
    vendor: "workos",
    apiKeyVar: "FAKE_WORKOS_KEY",
    defaultBaseUrl: "https://api.workos.test",
    capabilities: {},
  },
  { FAKE_WORKOS_KEY: "sk_probe_secret_123" },
);

const replyLayer = (status: number, body: unknown) =>
  Layer.succeed(
    HttpClientModule.HttpClient,
    HttpClientModule.make((request) =>
      Effect.succeed(
        HttpClientResponse.fromWeb(
          request,
          new Response(JSON.stringify(body), {
            status,
            headers: {
              "content-type": "application/json",
              "set-cookie": "wos-session=abc123",
              "x-request-id": "req_1",
            },
          }),
        ),
      ),
    ),
  );

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
    const bare = defineEnv(
      {
        vendor: "workos",
        apiKeyVar: "FAKE_WORKOS_KEY",
        defaultBaseUrl: "https://api.workos.test",
        capabilities: {},
      },
      {},
    );
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

describe("buildCapture", () => {
  it("scrubs request bodies including probe-declared extra keys", () => {
    const capture = buildCapture(
      defineProbe({
        id: "auth-bad-password",
        title: "invalid_credentials envelope",
        request: {
          method: "POST",
          pathTemplate: "/user_management/authenticate",
          body: {
            kind: "json",
            value: { email: "probe@example.com", password: "pw", magic: "m" },
          },
        },
        scrubKeys: ["magic"],
      }),
      "workos",
      { status: 400, headers: {}, body: { code: "invalid_credentials" } },
      [],
      "2026-07-20",
    );
    expect(capture.request.body).toEqual({
      email: "probe@example.com",
      password: SCRUBBED,
      magic: SCRUBBED,
    });
  });
});
