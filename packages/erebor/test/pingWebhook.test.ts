import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { archiveWebhook } from "../src/operations/archiveWebhook.ts";
import { createWebhook } from "../src/operations/createWebhook.ts";
import { pingWebhook } from "../src/operations/pingWebhook.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("pingWebhook", () => {
  describe("happy path", () => {
    it("sends a test event to an existing webhook", async () => {
      const created = await runEffect(
        createWebhook({
          name: `distilled-erebor-ping-${testRunId}`,
          webhook_url: `https://example.com/distilled-erebor-ping-${testRunId}`,
          event_types: ["TRANSACTION.SETTLED"],
        }),
      );
      try {
        const result = await runEffect(pingWebhook({ id: created.id }));
        expect(typeof result.success).toBe("boolean");
      } finally {
        await runEffect(archiveWebhook({ id: created.id }).pipe(Effect.ignore));
      }
    }, 30_000);
  });

  describe("errors", () => {
    it("returns Unauthorized when credentials are invalid", async () => {
      const BadCreds = Layer.succeed(Credentials, {
        apiKey: Redacted.make("not-a-real-key"),
        apiBaseUrl: DEFAULT_API_BASE_URL,
      });
      const error = await Effect.runPromise(
        pingWebhook({ id: unknownId("webhook") }).pipe(
          Effect.flip,
          Effect.provide(Layer.merge(BadCreds, FetchHttpClient.layer)),
        ),
      );
      expect(error._tag).toBe("Unauthorized");
    }, 30_000);

    it("returns NotFound for a non-existent id", async () => {
      const error = await runEffect(
        pingWebhook({ id: unknownId("webhook") }).pipe(Effect.flip),
      );
      expect(error._tag).toBe("NotFound");
    }, 30_000);
  });
});
