import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { generateAOneTimeLink } from "../src/operations/generateAOneTimeLink.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  inquiryId: "inquiryid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-generateAOneTimeLink",
} as any;

describe("generateAOneTimeLink", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        generateAOneTimeLink(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
