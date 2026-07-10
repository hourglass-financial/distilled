import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { listAllInquiryTemplates } from "../src/operations/listAllInquiryTemplates.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-listAllInquiryTemplates",
} as any;

describe("listAllInquiryTemplates", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        listAllInquiryTemplates(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
