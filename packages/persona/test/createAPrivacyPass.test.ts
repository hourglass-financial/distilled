import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createAPrivacyPass } from "../src/operations/createAPrivacyPass.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  "blinded-token": "distilled-persona-blinded-token",
  "key-id": "key_id_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createAPrivacyPass",
} as any;

describe("createAPrivacyPass", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createAPrivacyPass(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
