import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { getWebhook } from "../src/operations/getWebhook.ts";
import { listWebhooks } from "../src/operations/listWebhooks.ts";
import { runEffect, unknownId } from "./setup.ts";

describe("getWebhook", () => {
  describe("happy path", () => {
    it("retrieves an existing webhook by id", async () => {
      const list = await runEffect(listWebhooks({ page_size: 1 }));
      if (list.data.length === 0) return;
      const target = list.data[0]!;
      const result = await runEffect(getWebhook({ id: target.id }));
      expect(result.type).toBe("WEBHOOK");
      expect(result.id).toBe(target.id);
      expect(typeof result.name).toBe("string");
      expect(typeof result.webhook_url).toBe("string");
      expect(["ENABLED", "DISABLED", "ARCHIVED"]).toContain(result.status);
    }, 30_000);
  });

  describe("errors", () => {
    it("returns Unauthorized when credentials are invalid", async () => {
      const BadCreds = Layer.succeed(Credentials, {
        apiKey: Redacted.make("not-a-real-key"),
        apiBaseUrl: DEFAULT_API_BASE_URL,
      });
      const error = await Effect.runPromise(
        getWebhook({ id: unknownId("webhook") }).pipe(
          Effect.flip,
          Effect.provide(Layer.merge(BadCreds, FetchHttpClient.layer)),
        ),
      );
      expect(error._tag).toBe("Unauthorized");
    }, 30_000);

    it("returns NotFound for a non-existent id", async () => {
      const error = await runEffect(
        getWebhook({ id: unknownId("webhook") }).pipe(Effect.flip),
      );
      expect(error._tag).toBe("NotFound");
    }, 30_000);
  });
});
