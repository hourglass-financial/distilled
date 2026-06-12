import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { archiveWebhook } from "../src/operations/archiveWebhook.ts";
import { createWebhook } from "../src/operations/createWebhook.ts";
import { runEffect, testRunId } from "./setup.ts";

describe("createWebhook", () => {
  describe("happy path", () => {
    it("creates a webhook and cleans up via archive", async () => {
      const name = `distilled-erebor-webhook-${testRunId}`;
      const webhookUrl = `https://example.com/distilled-erebor-${testRunId}`;
      const created = await runEffect(
        createWebhook({
          name,
          webhook_url: webhookUrl,
          event_types: ["TRANSACTION.SETTLED"],
          custom_ref: `distilled-erebor-${testRunId}`,
          custom_fields: { test_run_id: testRunId, source: "distilled" },
        }),
      );
      try {
        expect(created.type).toBe("WEBHOOK");
        expect(typeof created.id).toBe("string");
        expect(created.name).toBe(name);
        expect(created.webhook_url).toBe(webhookUrl);
        expect(["ENABLED", "DISABLED", "ARCHIVED"]).toContain(created.status);
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
        createWebhook({
          name: `distilled-erebor-webhook-${testRunId}`,
          webhook_url: `https://example.com/distilled-erebor-${testRunId}`,
          event_types: ["TRANSACTION.SETTLED"],
        }).pipe(
          Effect.flip,
          Effect.provide(Layer.merge(BadCreds, FetchHttpClient.layer)),
        ),
      );
      expect(error._tag).toBe("Unauthorized");
    }, 30_000);

    it("returns BadRequest for an invalid webhook_url", async () => {
      const error = await runEffect(
        createWebhook({
          name: `distilled-erebor-webhook-${testRunId}`,
          webhook_url: "not-a-valid-url",
          event_types: ["TRANSACTION.SETTLED"],
        }).pipe(Effect.flip),
      );
      expect(error._tag).toBe("BadRequest");
    }, 30_000);
  });
});
