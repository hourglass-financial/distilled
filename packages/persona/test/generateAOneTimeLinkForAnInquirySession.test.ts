import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { generateAOneTimeLinkForAnInquirySession } from "../src/operations/generateAOneTimeLinkForAnInquirySession.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  inquirySessionId: "inquirysessionid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-generateAOneTimeLinkForAnInquirySession",
} as any;

describe("generateAOneTimeLinkForAnInquirySession", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        generateAOneTimeLinkForAnInquirySession(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
