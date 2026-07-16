import { beforeAll, describe, expect, it } from "vitest";
import { listAllDevices } from "../../src/operations/listAllDevices.ts";
import { listAllInquirySessions } from "../../src/operations/listAllInquirySessions.ts";
import { PERSONA_VERSION } from "../fixtures.ts";
import { runLiveEffect } from "../safe-run.ts";
import { beginLiveTestRun } from "../setup.ts";

// Coverage: live-envelope
describe("listAllDevices", () => {
  beforeAll(beginLiveTestRun);

  it("filters by an existing inquiry session and decodes the collection envelope", async () => {
    const sessions = await runLiveEffect(
      listAllInquirySessions({ personaVersion: PERSONA_VERSION }),
    );
    const inquirySessionId = sessions.data[0]?.id;
    if (!inquirySessionId) {
      throw new Error("Persona sandbox fixture is missing for listAllDevices");
    }

    const result = await runLiveEffect(
      listAllDevices({
        filter: { "inquiry-session-id": inquirySessionId },
        personaVersion: PERSONA_VERSION,
      }),
    );
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.links).toHaveProperty("prev");
    expect(result.links).toHaveProperty("next");
  }, 30_000);
});
