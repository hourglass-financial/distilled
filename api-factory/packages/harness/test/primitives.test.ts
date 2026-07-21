/**
 * The small harness primitives: run-unique naming, Scope-based resource
 * lifecycle, bounded polling, and the capability-declared environment.
 */
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Redacted from "effect/Redacted";
import { describe, expect, it } from "vitest";
import { defineEnv } from "../src/env.ts";
import { eventually } from "../src/eventually.ts";
import { resourceName, testRunId, uniqueEmail } from "../src/naming.ts";
import { resource } from "../src/resource.ts";

describe("naming", () => {
  it("testRunId is 8 hex chars, stable within the process", () => {
    expect(testRunId).toMatch(/^[0-9a-f]{8}$/);
    expect(testRunId).toBe(testRunId);
  });

  it("resourceName follows distilled-af-{vendor}-{name}-{testRunId}", () => {
    expect(resourceName("workos", "orgs-crud")).toBe(
      `distilled-af-workos-orgs-crud-${testRunId}`,
    );
  });

  it("uniqueEmail is unique per call and embeds the run id", () => {
    const first = uniqueEmail();
    const second = uniqueEmail();
    expect(first).not.toBe(second);
    expect(first).toContain(testRunId);
    expect(uniqueEmail("invitee")).toMatch(
      new RegExp(`^invitee-${testRunId}-\\d+@example\\.com$`),
    );
  });
});

describe("resource", () => {
  it("destroys on success, in LIFO order for chained resources", async () => {
    const events: string[] = [];
    const track = (name: string) =>
      resource(
        Effect.sync(() => {
          events.push(`create:${name}`);
          return name;
        }),
        (value) => Effect.sync(() => events.push(`destroy:${value}`)),
      );
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          yield* track("org");
          yield* track("user");
        }),
      ),
    );
    expect(events).toEqual([
      "create:org",
      "create:user",
      "destroy:user",
      "destroy:org",
    ]);
  });

  it("destroys when the test body fails", async () => {
    const events: string[] = [];
    const exit = await Effect.runPromiseExit(
      Effect.scoped(
        Effect.gen(function* () {
          yield* resource(Effect.succeed("org_1"), (id) =>
            Effect.sync(() => events.push(`destroy:${id}`)),
          );
          return yield* Effect.fail("assertion blew up");
        }),
      ),
    );
    expect(Exit.isFailure(exit)).toBe(true);
    expect(events).toEqual(["destroy:org_1"]);
  });

  it("destroys on interruption", async () => {
    const events: string[] = [];
    const exit = await Effect.runPromiseExit(
      Effect.scoped(
        Effect.gen(function* () {
          yield* resource(Effect.succeed("org_1"), (id) =>
            Effect.sync(() => events.push(`destroy:${id}`)),
          );
          yield* Effect.interrupt;
        }),
      ),
    );
    expect(Exit.isFailure(exit)).toBe(true);
    expect(events).toEqual(["destroy:org_1"]);
  });

  it("a failed create registers no destroy", async () => {
    const events: string[] = [];
    const exit = await Effect.runPromiseExit(
      Effect.scoped(
        resource(Effect.fail("create refused"), () =>
          Effect.sync(() => events.push("destroy")),
        ),
      ),
    );
    expect(Exit.isFailure(exit)).toBe(true);
    expect(events).toEqual([]);
  });

  it("swallows destroy failures so cleanup never masks the test outcome", async () => {
    const value = await Effect.runPromise(
      Effect.scoped(
        resource(Effect.succeed("org_1"), () => Effect.fail("cleanup 500")),
      ),
    );
    expect(value).toBe("org_1");
  });
});

describe("eventually", () => {
  it("retries until the effect succeeds", async () => {
    let attempts = 0;
    const settled = await Effect.runPromise(
      eventually(
        Effect.suspend(() => {
          attempts++;
          return attempts < 3
            ? Effect.fail("not ready yet")
            : Effect.succeed("ready");
        }),
        { interval: Duration.millis(1) },
      ),
    );
    expect(settled).toBe("ready");
    expect(attempts).toBe(3);
  });

  it("surfaces the last failure once the bound runs out", async () => {
    let attempts = 0;
    const exit = await Effect.runPromiseExit(
      eventually(
        Effect.suspend(() => {
          attempts++;
          return Effect.fail(`still not ready (${attempts})`);
        }),
        { interval: Duration.millis(1), times: 4 },
      ),
    );
    expect(Exit.isFailure(exit)).toBe(true);
    expect(attempts).toBe(5); // initial attempt + 4 retries
  });
});

describe("defineEnv", () => {
  const spec = {
    vendor: "workos",
    apiKeyVar: "WORKOS_API_KEY",
    baseUrlVar: "WORKOS_API_URL",
    defaultBaseUrl: "https://api.workos.com",
    capabilities: {
      authkit: ["WORKOS_CLIENT_ID"],
      "seeded-flag": ["WORKOS_FLAG_ID", "WORKOS_FLAG_ORG"],
    },
  } as const;

  it("credential-less: not live, no capabilities, default base URL", () => {
    const env = defineEnv(spec, {});
    expect(env.live).toBe(false);
    expect(env.apiKey).toBeUndefined();
    expect(env.baseUrl).toBe("https://api.workos.com");
    expect(env.has("authkit")).toBe(false);
    expect(env.missing(["authkit", "seeded-flag"])).toEqual([
      "authkit",
      "seeded-flag",
    ]);
  });

  it("partial seeding yields precise capability presence", () => {
    const env = defineEnv(spec, {
      WORKOS_API_KEY: "sk_test",
      WORKOS_API_URL: "https://staging.workos.test",
      WORKOS_CLIENT_ID: "client_1",
      WORKOS_FLAG_ID: "flag_1",
      // WORKOS_FLAG_ORG missing — seeded-flag is only half provisioned.
    });
    expect(env.live).toBe(true);
    expect(Redacted.value(env.apiKey!)).toBe("sk_test");
    expect(env.baseUrl).toBe("https://staging.workos.test");
    expect(env.has("authkit")).toBe(true);
    expect(env.has("seeded-flag")).toBe(false);
    expect(env.missing(["authkit", "seeded-flag"])).toEqual(["seeded-flag"]);
    expect(env.value("WORKOS_CLIENT_ID")).toBe("client_1");
    expect(env.declared).toEqual(["authkit", "seeded-flag"]);
  });

  it("an empty-string credential does not count as live", () => {
    const env = defineEnv(spec, { WORKOS_API_KEY: "" });
    expect(env.live).toBe(false);
  });
});
