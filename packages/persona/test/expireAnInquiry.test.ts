import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { expireAnInquiry } from "../src/operations/expireAnInquiry.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  inquiryId: "inquiryid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-expireAnInquiry",
} as any;

describe("expireAnInquiry", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        expireAnInquiry(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
