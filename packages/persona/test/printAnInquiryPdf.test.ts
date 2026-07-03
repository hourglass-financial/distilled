import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { printAnInquiryPdf } from "../src/operations/printAnInquiryPdf.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  inquiryId: "inquiryid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-printAnInquiryPdf",
} as any;

describe("printAnInquiryPdf", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        printAnInquiryPdf(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
