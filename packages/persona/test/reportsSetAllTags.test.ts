import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { reportsSetAllTags } from "../src/operations/reportsSetAllTags.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  reportId: "reportid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-reportsSetAllTags",
} as any;

describe("reportsSetAllTags", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        reportsSetAllTags(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
