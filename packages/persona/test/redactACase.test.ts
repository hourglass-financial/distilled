import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { redactACase } from "../src/operations/redactACase.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  caseId: "caseid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-redactACase",
} as any;

describe("redactACase", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        redactACase(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
