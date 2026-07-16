import { beforeAll, describe, expect, it } from "vitest";
import { listAllCases } from "../../src/operations/listAllCases.ts";
import { PERSONA_VERSION } from "../fixtures.ts";
import { runLiveEffect } from "../safe-run.ts";
import { beginLiveTestRun } from "../setup.ts";

// Coverage: live-data
describe("listAllCases", () => {
  beforeAll(beginLiveTestRun);

  it("decodes the populated authenticated collection", async () => {
    const result = await runLiveEffect(
      listAllCases({ page: { size: 1 }, personaVersion: PERSONA_VERSION }),
    );
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]).toBeDefined();
  }, 30_000);
});
