import { beforeAll, describe, expect, it } from "vitest";
import { listAllApiLogs } from "../src/operations/listAllApiLogs.ts";
import { retrieveAnApiLog } from "../src/operations/retrieveAnApiLog.ts";
import { PERSONA_VERSION } from "./fixtures.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-data
describe("retrieveAnApiLog", () => {
  beforeAll(beginLiveTestRun);

  it("retrieves and decodes a resource exposed by the sandbox", async () => {
    const listed = await runLiveEffect(
      listAllApiLogs({ page: { size: 1 }, personaVersion: PERSONA_VERSION }),
    );
    const id = listed.data[0]?.id;
    if (!id)
      throw new Error(
        "Persona sandbox fixture is missing for retrieveAnApiLog",
      );

    const result = await runLiveEffect(
      retrieveAnApiLog({ apiLogId: id, personaVersion: PERSONA_VERSION }),
    );
    expect(result.data.id).toBe(id);
  }, 30_000);
});
