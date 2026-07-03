import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { retrieveAWorkflowRun } from "../src/operations/retrieveAWorkflowRun.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  workflowRunId: "workflowrunid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-retrieveAWorkflowRun",
} as any;

describe("retrieveAWorkflowRun", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        retrieveAWorkflowRun(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
