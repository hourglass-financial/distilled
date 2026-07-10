import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { markAnInquiryForReview } from "../src/operations/markAnInquiryForReview.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  inquiryId: "inquiryid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-markAnInquiryForReview",
} as any;

describe("markAnInquiryForReview", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        markAnInquiryForReview(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
