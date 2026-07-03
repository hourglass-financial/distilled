import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { retrieveAReport } from "../src/operations/retrieveAReport.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  reportId: "reportid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-retrieveAReport",
} as any;

describe("retrieveAReport", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        retrieveAReport(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
