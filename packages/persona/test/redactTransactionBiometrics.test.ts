import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { redactTransactionBiometrics } from "../src/operations/redactTransactionBiometrics.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  transactionId: "transactionid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-redactTransactionBiometrics",
} as any;

describe("redactTransactionBiometrics", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        redactTransactionBiometrics(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
