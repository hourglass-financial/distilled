import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { retrieveAnEcbsvDatabaseVerification } from "../src/operations/retrieveAnEcbsvDatabaseVerification.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  verificationId: "verificationid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-retrieveAnEcbsvDatabaseVerification",
} as any;

describe("retrieveAnEcbsvDatabaseVerification", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        retrieveAnEcbsvDatabaseVerification(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
