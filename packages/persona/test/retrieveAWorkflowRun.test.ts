import { beforeAll, describe, expect, it } from "vitest";
import { listAllWorkflowRuns } from "../src/operations/listAllWorkflowRuns.ts";
import { retrieveAWorkflowRun } from "../src/operations/retrieveAWorkflowRun.ts";
import { PERSONA_VERSION } from "./fixtures.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-data
describe("retrieveAWorkflowRun", () => {
  beforeAll(beginLiveTestRun);

  it("retrieves and decodes a resource exposed by the sandbox", async () => {
    const listed = await runLiveEffect(
      listAllWorkflowRuns({
        page: { size: 1 },
        personaVersion: PERSONA_VERSION,
      }),
    );
    const id = listed.data[0]?.id;
    if (!id)
      throw new Error(
        "Persona sandbox fixture is missing for retrieveAWorkflowRun",
      );

    const result = await runLiveEffect(
      retrieveAWorkflowRun({
        workflowRunId: id,
        personaVersion: PERSONA_VERSION,
      }),
    );
    expect(result.data.id).toBe(id);
  }, 30_000);
});
