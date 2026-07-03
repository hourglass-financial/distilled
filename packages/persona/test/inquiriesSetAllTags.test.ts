import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { inquiriesSetAllTags } from "../src/operations/inquiriesSetAllTags.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  inquiryId: "inquiryid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-inquiriesSetAllTags",
} as any;

describe("inquiriesSetAllTags", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        inquiriesSetAllTags(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
