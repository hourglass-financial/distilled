import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { printAVerificationAsPdf } from "../src/operations/printAVerificationAsPdf.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  verificationId: "verificationid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-printAVerificationAsPdf",
} as any;

describe("printAVerificationAsPdf", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        printAVerificationAsPdf(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
