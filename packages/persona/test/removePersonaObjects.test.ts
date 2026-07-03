import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { removePersonaObjects } from "../src/operations/removePersonaObjects.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  caseId: "caseid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-removePersonaObjects",
} as any;

describe("removePersonaObjects", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        removePersonaObjects(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
