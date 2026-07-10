import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { retrieveATinDatabaseVerification } from "../src/operations/retrieveATinDatabaseVerification.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  verificationId: "verificationid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-retrieveATinDatabaseVerification",
} as any;

describe("retrieveATinDatabaseVerification", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        retrieveATinDatabaseVerification(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
