import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { archiveWebhook } from "../src/operations/archiveWebhook.ts";
import { createWebhook } from "../src/operations/createWebhook.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("archiveWebhook", () => {
  describe("happy path", () => {
    it("archives an existing webhook", async () => {
      const created = await runEffect(
        createWebhook({
          name: `distilled-erebor-archive-${testRunId}`,
          webhook_url: `https://example.com/distilled-erebor-archive-${testRunId}`,
          event_types: ["TRANSACTION.SETTLED"],
        }),
      );
      const result = await runEffect(archiveWebhook({ id: created.id }));
      expect(result.type).toBe("WEBHOOK");
      expect(result.id).toBe(created.id);
      expect(result.status).toBe("ARCHIVED");
      expect(typeof result.archived_at).toBe("string");
    }, 30_000);
  });

  describe("errors", () => {
    it("returns Unauthorized when credentials are invalid", async () => {
      const BadCreds = Layer.succeed(Credentials, {
        apiKey: Redacted.make("not-a-real-key"),
        apiBaseUrl: DEFAULT_API_BASE_URL,
      });
      const error = await Effect.runPromise(
        archiveWebhook({ id: unknownId("webhook") }).pipe(
          Effect.flip,
          Effect.provide(Layer.merge(BadCreds, FetchHttpClient.layer)),
        ),
      );
      expect(error._tag).toBe("Unauthorized");
    }, 30_000);

    it("returns NotFound for a non-existent id", async () => {
      const error = await runEffect(
        archiveWebhook({ id: unknownId("webhook") }).pipe(Effect.flip),
      );
      expect(error._tag).toBe("NotFound");
    }, 30_000);
  });
});
