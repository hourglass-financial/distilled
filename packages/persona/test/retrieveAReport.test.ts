import { beforeAll, describe, expect, it } from "vitest";
import { listAllReports } from "../src/operations/listAllReports.ts";
import { retrieveAReport } from "../src/operations/retrieveAReport.ts";
import { PERSONA_VERSION } from "./fixtures.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-data
describe("retrieveAReport", () => {
  beforeAll(beginLiveTestRun);

  it("retrieves and decodes a resource exposed by the sandbox", async () => {
    const listed = await runLiveEffect(
      listAllReports({ page: { size: 1 }, personaVersion: PERSONA_VERSION }),
    );
    const listedReport = listed.data[0];
    const id =
      typeof listedReport === "object" &&
      listedReport !== null &&
      "id" in listedReport
        ? listedReport.id
        : undefined;
    if (!id)
      throw new Error("Persona sandbox fixture is missing for retrieveAReport");
    if (typeof id !== "string")
      throw new Error("Persona report id was not a string");

    const result = await runLiveEffect(
      retrieveAReport({ reportId: id, personaVersion: PERSONA_VERSION }),
    );
    expect(result.data).toMatchObject({ id });
  }, 30_000);
});
