import { beforeAll, describe, expect, it } from "vitest";
import { listAllInquirySessions } from "../src/operations/listAllInquirySessions.ts";
import { PERSONA_VERSION } from "./fixtures.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-data
describe("listAllInquirySessions", () => {
  beforeAll(beginLiveTestRun);

  it("decodes the populated authenticated collection", async () => {
    const result = await runLiveEffect(
      listAllInquirySessions({ personaVersion: PERSONA_VERSION }),
    );
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]).toBeDefined();
  }, 30_000);
});
