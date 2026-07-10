import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { expireAnApiKey } from "../src/operations/expireAnApiKey.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  apiKeyId: "apikeyid_distilled_missing",
  meta: {
    "expires-in-seconds": 1,
  },
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-expireAnApiKey",
} as any;

describe("expireAnApiKey", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        expireAnApiKey(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
