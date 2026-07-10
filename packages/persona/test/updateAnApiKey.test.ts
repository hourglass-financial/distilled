import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { updateAnApiKey } from "../src/operations/updateAnApiKey.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  apiKeyId: "apikeyid_distilled_missing",
  data: {
    attributes: {},
  },
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-updateAnApiKey",
} as any;

describe("updateAnApiKey", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        updateAnApiKey(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
