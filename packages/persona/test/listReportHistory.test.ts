import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { listReportHistory } from "../src/operations/listReportHistory.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  reportId: "reportid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-listReportHistory",
} as any;

describe("listReportHistory", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        listReportHistory(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
