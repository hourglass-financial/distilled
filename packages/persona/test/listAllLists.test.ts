import { beforeAll, describe, expect, it } from "vitest";
import { listAllLists } from "../src/operations/listAllLists.ts";
import { PERSONA_VERSION } from "./fixtures.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-data
describe("listAllLists", () => {
  beforeAll(beginLiveTestRun);

  it("decodes the populated authenticated collection", async () => {
    const result = await runLiveEffect(
      listAllLists({ page: { size: 100 }, personaVersion: PERSONA_VERSION }),
    );
    expect(result.data.length).toBeGreaterThan(0);
    for (const list of result.data) {
      expect(list.id).toMatch(/^lst_/);
      expect(list.attributes?.status).toMatch(/^(active|archived)$/);
    }
  }, 30_000);
});
