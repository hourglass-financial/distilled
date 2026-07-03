import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createAWebhook } from "../src/operations/createAWebhook.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  data: {
    attributes: {},
  },
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createAWebhook",
} as any;

describe("createAWebhook", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createAWebhook(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
