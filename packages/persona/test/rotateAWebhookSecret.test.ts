import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { rotateAWebhookSecret } from "../src/operations/rotateAWebhookSecret.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  webhookId: "webhookid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-rotateAWebhookSecret",
} as any;

describe("rotateAWebhookSecret", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        rotateAWebhookSecret(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
