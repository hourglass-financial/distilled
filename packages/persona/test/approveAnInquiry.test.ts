import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { approveAnInquiry } from "../src/operations/approveAnInquiry.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  inquiryId: "inquiryid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-approveAnInquiry",
} as any;

describe("approveAnInquiry", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        approveAnInquiry(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
