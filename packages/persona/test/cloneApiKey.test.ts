import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { cloneApiKey } from "../src/operations/cloneApiKey.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  apiKeyId: "apikeyid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-cloneApiKey",
} as any;

describe("cloneApiKey", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        cloneApiKey(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
