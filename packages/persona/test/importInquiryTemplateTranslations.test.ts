import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { importInquiryTemplateTranslations } from "../src/operations/importInquiryTemplateTranslations.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  inquiryTemplateId: "inquirytemplateid_distilled_missing",
  data: {
    attributes: {
      translations: [
        {
          step: "distilled-persona-step",
          component: "distilled-persona-component",
          "attribute-name": "distilled-persona-attribute",
          "locale-values": [
            {
              locale: "en",
              value: "distilled-persona-value",
            },
          ],
        },
      ],
    },
  },
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-importInquiryTemplateTranslations",
} as any;

describe("importInquiryTemplateTranslations", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        importInquiryTemplateTranslations(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
