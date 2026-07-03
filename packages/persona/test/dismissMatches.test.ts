import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { dismissMatches } from "../src/operations/dismissMatches.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  reportId: "reportid_distilled_missing",
  data: {},
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-dismissMatches",
} as any;

describe("dismissMatches", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        dismissMatches(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
