import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { setStatusForACase } from "../src/operations/setStatusForACase.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  caseId: "caseid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-setStatusForACase",
} as any;

describe("setStatusForACase", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        setStatusForACase(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
