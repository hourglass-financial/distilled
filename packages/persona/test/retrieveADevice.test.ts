import { beforeAll, describe, expect, it } from "vitest";
import { retrieveADevice } from "../src/operations/retrieveADevice.ts";
import { missingId, PERSONA_VERSION } from "./fixtures.ts";
import { runFailure } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: error-only
describe("retrieveADevice", () => {
  beforeAll(beginLiveTestRun);

  it("returns typed NotFound for a valid-format missing device id", async () => {
    const failure = await runFailure(
      retrieveADevice({
        deviceId: missingId("dev"),
        personaVersion: PERSONA_VERSION,
      }),
    );
    expect(failure.tag).toBe("NotFound");
  }, 30_000);
});
