import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { retrieveAWebhook } from "../src/operations/retrieveAWebhook.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  webhookId: "webhookid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-retrieveAWebhook",
} as any;

describe("retrieveAWebhook", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        retrieveAWebhook(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
