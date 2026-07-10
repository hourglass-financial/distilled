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
import { createAnAccount } from "../src/operations/createAnAccount.ts";
import { redactAnAccount } from "../src/operations/redactAnAccount.ts";

config();

const TestLayer = Layer.merge(CredentialsFromEnv, FetchHttpClient.layer);

const runEffect = <A, E, R>(effect: Effect.Effect<A, E, R>): Promise<A> =>
  Effect.runPromise(
    effect.pipe(Effect.provide(TestLayer)) as Effect.Effect<A, E, never>,
  );

const testRunId = crypto.randomUUID().replace(/-/g, "").slice(0, 8);

const accountReferenceId = (name: string) =>
  `distilled-persona-account-${name}-${testRunId}`;

const cleanupAccount = (getAccountId: () => string | undefined) =>
  Effect.suspend(() => {
    const accountId = getAccountId();
    return accountId
      ? redactAnAccount({
          accountId,
          idempotencyKey: accountReferenceId("redact"),
          personaVersion: "2025-12-08",
        }).pipe(Effect.ignore)
      : Effect.void;
  });

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

describe("createAnAccount", () => {
  it("happy path - creates an account with a synthetic reference id", async () => {
    let accountId: string | undefined;
    const referenceId = accountReferenceId("create");

    await runEffect(
      Effect.gen(function* () {
        const result = yield* createAnAccount({
          idempotencyKey: referenceId,
          personaVersion: "2025-12-08",
          data: {
            attributes: {
              "reference-id": referenceId,
              tags: [accountReferenceId("tag")],
            },
          },
        });

        accountId = result.data.id;

        expect(result.data.type).toBe("account");
        expect(accountId).toMatch(/^act_/);
        expect(result.data.attributes?.["reference-id"]).toBe(referenceId);
        expect(result.data.attributes?.tags).toContain(
          accountReferenceId("tag").toUpperCase(),
        );
      }).pipe(Effect.ensuring(cleanupAccount(() => accountId))),
    );
  }, 30_000);

  it("error - NotFound for a missing accounts route", async () => {
    await Effect.runPromise(
      createAnAccount({
        idempotencyKey: accountReferenceId("missing-route"),
        personaVersion: "2025-12-08",
        data: {
          attributes: {
            "reference-id": accountReferenceId("missing-route"),
          },
        },
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
