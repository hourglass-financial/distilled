import { beforeAll, describe, expect, it } from "vitest";
import { listAllApiLogs } from "../../src/operations/listAllApiLogs.ts";
import { retrieveAnApiLog } from "../../src/operations/retrieveAnApiLog.ts";
import { PERSONA_VERSION, missingId } from "../fixtures.ts";
import { runFailure, runLiveEffect } from "../safe-run.ts";
import { beginLiveTestRun } from "../setup.ts";

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

  it("returns NotFound for a valid-format missing API log", async () => {
    const failure = await runFailure(
      retrieveAnApiLog({
        apiLogId: missingId("api"),
        personaVersion: PERSONA_VERSION,
      }),
    );
    expect(failure.tag).toBe("NotFound");
  }, 30_000);
});
