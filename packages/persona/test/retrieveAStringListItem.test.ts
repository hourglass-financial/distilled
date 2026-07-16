import { beforeAll, describe, expect, it } from "vitest";
import { retrieveAStringListItem } from "../src/operations/retrieveAStringListItem.ts";
import { missingId, PERSONA_VERSION } from "./fixtures.ts";
import { runFailure } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: error-only
describe("retrieveAStringListItem", () => {
  beforeAll(beginLiveTestRun);

  it("returns NotFound for a valid-format missing id", async () => {
    const failure = await runFailure(
      retrieveAStringListItem({
        listItemId: missingId("liit"),
        personaVersion: PERSONA_VERSION,
      }),
    );
    expect(failure.tag).toBe("NotFound");
  }, 30_000);
});
