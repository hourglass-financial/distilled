import { beforeAll, describe, expect, it } from "vitest";
import { listAllCases } from "../src/operations/listAllCases.ts";
import { retrieveCase } from "../src/operations/retrieveCase.ts";
import { PERSONA_VERSION } from "./fixtures.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

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
});
