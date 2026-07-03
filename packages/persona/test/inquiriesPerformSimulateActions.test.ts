import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { inquiriesPerformSimulateActions } from "../src/operations/inquiriesPerformSimulateActions.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  inquiryId: "inquiryid_distilled_missing",
  meta: {
    "simulate-actions": [],
  },
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-inquiriesPerformSimulateActions",
} as any;

describe("inquiriesPerformSimulateActions", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        inquiriesPerformSimulateActions(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
