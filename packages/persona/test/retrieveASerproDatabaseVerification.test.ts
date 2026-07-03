import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { retrieveASerproDatabaseVerification } from "../src/operations/retrieveASerproDatabaseVerification.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  verificationId: "verificationid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-retrieveASerproDatabaseVerification",
} as any;

describe("retrieveASerproDatabaseVerification", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        retrieveASerproDatabaseVerification(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
