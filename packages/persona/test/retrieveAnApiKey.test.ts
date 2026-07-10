import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { retrieveAnApiKey } from "../src/operations/retrieveAnApiKey.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  apiKeyId: "apikeyid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-retrieveAnApiKey",
} as any;

describe("retrieveAnApiKey", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        retrieveAnApiKey(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
