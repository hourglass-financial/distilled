import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createAWorkflowRun } from "../src/operations/createAWorkflowRun.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  workflowId: "workflowid_distilled_missing",
  data: {
    attributes: {
      fields: {},
    },
  },
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createAWorkflowRun",
} as any;

describe("createAWorkflowRun", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createAWorkflowRun(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
