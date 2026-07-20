/**
 * Living usage of the wrappers and the projection: this file registers real
 * tests through `contractTest` / `makeLiveTest` / `coverageSuite`, so the
 * harness's own run shows exactly what a vendor suite will look like —
 * stamped titles, gated skips, native todo/skip projection lines.
 */
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { describe, expect, it } from "vitest";
import { coverageSuite } from "../src/coverage/suite.ts";
import { defineEnv } from "../src/env.ts";
import { resource } from "../src/resource.ts";
import { contractTest, makeLiveTest } from "../src/testkit.ts";

// A tiny fake vendor: one service the "client layer" provides.
class FakeClient extends Context.Service<
  FakeClient,
  { readonly ping: () => string }
>()("harness-test/FakeClient") {}
const fakeLayer = Layer.succeed(
  FakeClient,
  FakeClient.of({ ping: () => "pong" }),
);

describe("contractTest", () => {
  contractTest(
    "stamps the covered op into its own title",
    { covers: "organizations.create" },
    () => {
      expect(expect.getState().currentTestName).toContain(
        "[contract:organizations.create]",
      );
    },
  );
});

describe("makeLiveTest (provisioned env)", () => {
  const env = defineEnv(
    {
      vendor: "fake",
      apiKeyVar: "FAKE_API_KEY",
      defaultBaseUrl: "https://api.fake.test",
      capabilities: { seeded: ["FAKE_SEEDED_ID"] },
    },
    { FAKE_API_KEY: "sk_fake", FAKE_SEEDED_ID: "seed_1" },
  );
  const liveTest = makeLiveTest({ env, layer: fakeLayer });
  const events: string[] = [];

  liveTest(
    "runs the body scoped with the layer provided",
    { covers: "organizations.create", needs: ["seeded"] },
    () =>
      Effect.gen(function* () {
        const client = yield* FakeClient;
        expect(client.ping()).toBe("pong");
        const acquired = yield* resource(
          Effect.sync(() => {
            events.push("create");
            return "org_1";
          }),
          (id) => Effect.sync(() => events.push(`destroy:${id}`)),
        );
        expect(acquired).toBe("org_1");
        expect(expect.getState().currentTestName).toContain(
          "[live:organizations.create]",
        );
      }),
  );

  it("tore the resource down when the scope closed", () => {
    // Runs after the liveTest above (vitest executes a file's tests in
    // declaration order), so the scope has closed and LIFO teardown ran.
    expect(events).toEqual(["create", "destroy:org_1"]);
  });
});

describe("makeLiveTest (gated env)", () => {
  const bare = defineEnv(
    {
      vendor: "fake",
      apiKeyVar: "FAKE_API_KEY",
      defaultBaseUrl: "https://api.fake.test",
      capabilities: { seeded: ["FAKE_SEEDED_ID"] },
    },
    {},
  );
  const withKeyOnly = defineEnv(
    {
      vendor: "fake",
      apiKeyVar: "FAKE_API_KEY",
      defaultBaseUrl: "https://api.fake.test",
      capabilities: { seeded: ["FAKE_SEEDED_ID"] },
    },
    { FAKE_API_KEY: "sk_fake" },
  );

  // Both register as VISIBLE skips in this very run — the skip titles below
  // name exactly what is missing, which is the decision-9 contract.
  makeLiveTest({ env: bare, layer: fakeLayer })(
    "credential-less runs skip naming the credential var",
    { covers: "organizations.get" },
    () => Effect.die("never runs"),
  );
  makeLiveTest({ env: withKeyOnly, layer: fakeLayer })(
    "missing capabilities skip naming the capability",
    { covers: "organizations.get", needs: ["seeded"] },
    () => Effect.die("never runs"),
  );
});

// The projection, driven by a small fixture: its own audit test passes and
// the todo/skip/untestable entries below render as native vitest lines.
coverageSuite({
  vendor: "fake",
  registry: ["organizations.create", "organizations.get", "sso.getProfile"],
  manifest: {
    "organizations.create": { contract: "tested", live: "tested" },
    "organizations.get": { contract: "todo", live: "todo" },
    "sso.getProfile": {
      contract: "todo",
      live: {
        status: "untestable",
        reason: "needs a real IdP round-trip",
      },
    },
  },
});
