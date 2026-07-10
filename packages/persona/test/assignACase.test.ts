import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { assignACase } from "../src/operations/assignACase.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  caseId: "caseid_distilled_missing",
  meta: {
    "user-email-address": "distilled-persona@example.com",
  },
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-assignACase",
} as any;

describe("assignACase", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        assignACase(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
