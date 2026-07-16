import { beforeAll, describe, expect, it } from "vitest";
import { listAllImporters } from "../src/operations/listAllImporters.ts";
import { PERSONA_VERSION } from "./fixtures.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-envelope
describe("listAllImporters", () => {
  beforeAll(beginLiveTestRun);

  it("decodes the authenticated collection envelope", async () => {
    const result = await runLiveEffect(
      listAllImporters({ page: { size: 1 }, personaVersion: PERSONA_VERSION }),
    );
    expect(Array.isArray(result.data)).toBe(true);
  }, 30_000);
});
