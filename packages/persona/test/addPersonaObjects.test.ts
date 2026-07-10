import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { addPersonaObjects } from "../src/operations/addPersonaObjects.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  caseId: "caseid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-addPersonaObjects",
} as any;

describe("addPersonaObjects", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        addPersonaObjects(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
