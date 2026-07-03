import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { removeTag } from "../src/operations/removeTag.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  caseId: "caseid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-removeTag",
} as any;

describe("removeTag", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        removeTag(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
