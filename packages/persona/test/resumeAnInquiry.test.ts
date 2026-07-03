import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { resumeAnInquiry } from "../src/operations/resumeAnInquiry.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  inquiryId: "inquiryid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-resumeAnInquiry",
} as any;

describe("resumeAnInquiry", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        resumeAnInquiry(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
