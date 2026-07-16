import { beforeAll, describe, expect, it } from "vitest";
import { listAllCases } from "../../src/operations/listAllCases.ts";
import { retrieveCase } from "../../src/operations/retrieveCase.ts";
import { PERSONA_VERSION, missingId } from "../fixtures.ts";
import { runFailure, runLiveEffect } from "../safe-run.ts";
import { beginLiveTestRun } from "../setup.ts";

// Coverage: live-data
describe("retrieveCase", () => {
  beforeAll(beginLiveTestRun);

  it("retrieves and decodes a resource exposed by the sandbox", async () => {
    const listed = await runLiveEffect(
      listAllCases({ page: { size: 1 }, personaVersion: PERSONA_VERSION }),
    );
    const id = listed.data[0]?.id;
    if (!id)
      throw new Error("Persona sandbox fixture is missing for retrieveCase");

    const result = await runLiveEffect(
      retrieveCase({ caseId: id, personaVersion: PERSONA_VERSION }),
    );
    expect(result.data.id).toBe(id);
  }, 30_000);

  it("returns NotFound for a valid-format missing case", async () => {
    const failure = await runFailure(
      retrieveCase({
        caseId: missingId("case"),
        personaVersion: PERSONA_VERSION,
      }),
    );
    expect(failure.tag).toBe("NotFound");
  }, 30_000);
});
