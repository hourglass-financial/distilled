import { beforeAll, describe, expect, it } from "vitest";
import { retrieveAList } from "../src/operations/retrieveAList.ts";
import { missingId, PERSONA_VERSION } from "./fixtures.ts";
import { runFailure } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: error-only
describe("retrieveAList", () => {
  beforeAll(beginLiveTestRun);

  it("returns NotFound for a valid-format missing id", async () => {
    const failure = await runFailure(
      retrieveAList({
        listId: missingId("lst"),
        personaVersion: PERSONA_VERSION,
      }),
    );
    expect(failure.tag).toBe("NotFound");
  }, 30_000);
});
