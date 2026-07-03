import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { reportsAddTag } from "../src/operations/reportsAddTag.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  reportId: "reportid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-reportsAddTag",
} as any;

describe("reportsAddTag", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        reportsAddTag(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
