import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { reportActionPauseContinuousMonitoring } from "../src/operations/reportActionPauseContinuousMonitoring.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  reportId: "reportid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-reportActionPauseContinuousMonitoring",
} as any;

describe("reportActionPauseContinuousMonitoring", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        reportActionPauseContinuousMonitoring(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
