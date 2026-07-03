import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { listAllWorkflowRuns } from "../src/operations/listAllWorkflowRuns.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-listAllWorkflowRuns",
} as any;

describe("listAllWorkflowRuns", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        listAllWorkflowRuns(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
