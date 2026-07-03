import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { retrieveAGovernmentIdVerification } from "../src/operations/retrieveAGovernmentIdVerification.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  verificationId: "verificationid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-retrieveAGovernmentIdVerification",
} as any;

describe("retrieveAGovernmentIdVerification", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        retrieveAGovernmentIdVerification(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
