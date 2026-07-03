import { config } from "dotenv";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import {
  Credentials,
  CredentialsFromEnv,
  DEFAULT_API_BASE_URL,
} from "../src/credentials.ts";
import { searchAccounts } from "../src/operations/searchAccounts.ts";

config();

const TestLayer = Layer.merge(CredentialsFromEnv, FetchHttpClient.layer);

const runEffect = <A, E, R>(effect: Effect.Effect<A, E, R>): Promise<A> =>
  Effect.runPromise(
    effect.pipe(Effect.provide(TestLayer)) as Effect.Effect<A, E, never>,
  );

const testRunId = crypto.randomUUID().replace(/-/g, "").slice(0, 8);

const searchKey = (name: string) =>
  `distilled-persona-search-${name}-${testRunId}`;

const missingRouteLayer = () => {
  const apiKey = process.env.PERSONA_API_KEY;
  if (!apiKey) {
    throw new Error("PERSONA_API_KEY environment variable is required");
  }
  return Layer.merge(
    Layer.succeed(Credentials, {
      apiKey: Redacted.make(apiKey),
      apiBaseUrl: `${DEFAULT_API_BASE_URL}/distilled-persona-missing-${testRunId}`,
    }),
    FetchHttpClient.layer,
  );
};

describe("searchAccounts", () => {
  it("happy path - searches accounts with a future created_at query", async () => {
    const result = await runEffect(
      searchAccounts({
        idempotencyKey: searchKey("future"),
        page: { size: 1 },
        personaVersion: "2025-12-08",
        query: {
          attribute: "created_at",
          operator: "gte",
          value: "2100-01-01",
        },
        sort: {
          attribute: "created_at",
          direction: "desc",
        },
      }),
    );

    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBe(0);
    expect(result.links).toBeDefined();
    expect(
      result.links.prev === null || typeof result.links.prev === "string",
    ).toBe(true);
    expect(
      result.links.next === null || typeof result.links.next === "string",
    ).toBe(true);

    for (const account of result.data) {
      expect(account.type).toBe("account");
      expect(account.id).toMatch(/^act_/);
    }
  }, 30_000);

  it("error - NotFound for a missing accounts search route", async () => {
    await Effect.runPromise(
      searchAccounts({
        idempotencyKey: searchKey("missing-route"),
        personaVersion: "2025-12-08",
      }).pipe(
        Effect.flip,
        Effect.map((e) => {
          expect(e._tag).toBe("NotFound");
        }),
        Effect.provide(missingRouteLayer()),
      ),
    );
  }, 30_000);
});
