import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { updateAWebhook } from "../src/operations/updateAWebhook.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  webhookId: "webhookid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-updateAWebhook",
} as any;

describe("updateAWebhook", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        updateAWebhook(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
