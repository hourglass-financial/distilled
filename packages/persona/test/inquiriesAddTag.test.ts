import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { inquiriesAddTag } from "../src/operations/inquiriesAddTag.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  inquiryId: "inquiryid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-inquiriesAddTag",
} as any;

describe("inquiriesAddTag", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        inquiriesAddTag(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
