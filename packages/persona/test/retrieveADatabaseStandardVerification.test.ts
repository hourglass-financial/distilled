import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { retrieveADatabaseStandardVerification } from "../src/operations/retrieveADatabaseStandardVerification.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  verificationId: "verificationid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-retrieveADatabaseStandardVerification",
} as any;

describe("retrieveADatabaseStandardVerification", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        retrieveADatabaseStandardVerification(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
