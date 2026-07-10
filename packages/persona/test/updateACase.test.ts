import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { updateACase } from "../src/operations/updateACase.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  caseId: "caseid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-updateACase",
} as any;

describe("updateACase", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        updateACase(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
