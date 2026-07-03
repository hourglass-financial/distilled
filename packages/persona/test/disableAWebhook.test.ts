import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { disableAWebhook } from "../src/operations/disableAWebhook.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  webhookId: "webhookid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-disableAWebhook",
} as any;

describe("disableAWebhook", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        disableAWebhook(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
