import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { retrieveInquiryTemplateTranslations } from "../src/operations/retrieveInquiryTemplateTranslations.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  inquiryTemplateId: "inquirytemplateid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-retrieveInquiryTemplateTranslations",
} as any;

describe("retrieveInquiryTemplateTranslations", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        retrieveInquiryTemplateTranslations(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
