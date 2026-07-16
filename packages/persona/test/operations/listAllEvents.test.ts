import { beforeAll, describe, expect, it } from "vitest";
import { listAllEvents } from "../../src/operations/listAllEvents.ts";
import { PERSONA_VERSION } from "../fixtures.ts";
import { runLiveEffect } from "../safe-run.ts";
import { beginLiveTestRun } from "../setup.ts";

// Coverage: live-data
describe("listAllEvents", () => {
  beforeAll(beginLiveTestRun);

  it("decodes the populated authenticated collection", async () => {
    const result = await runLiveEffect(
      listAllEvents({ page: { size: 1 }, personaVersion: PERSONA_VERSION }),
    );
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]).toBeDefined();
  }, 30_000);
});
