import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { archiveAWebhook } from "../src/operations/archiveAWebhook.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  webhookId: "webhookid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-archiveAWebhook",
} as any;

describe("archiveAWebhook", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        archiveAWebhook(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
