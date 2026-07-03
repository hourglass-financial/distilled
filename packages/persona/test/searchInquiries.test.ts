import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { searchInquiries } from "../src/operations/searchInquiries.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-searchInquiries",
} as any;

describe("searchInquiries", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        searchInquiries(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
