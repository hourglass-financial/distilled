import { beforeAll, describe, expect, it } from "vitest";
import { listAllInquirySessions } from "../../src/operations/listAllInquirySessions.ts";
import { retrieveAnInquirySession } from "../../src/operations/retrieveAnInquirySession.ts";
import { PERSONA_VERSION, missingId } from "../fixtures.ts";
import { runFailure, runLiveEffect } from "../safe-run.ts";
import { beginLiveTestRun } from "../setup.ts";

// Coverage: live-data
describe("retrieveAnInquirySession", () => {
  beforeAll(beginLiveTestRun);

  it("retrieves and decodes a resource exposed by the sandbox", async () => {
    const listed = await runLiveEffect(
      listAllInquirySessions({ personaVersion: PERSONA_VERSION }),
    );
    const id = listed.data[0]?.id;
    if (!id)
      throw new Error(
        "Persona sandbox fixture is missing for retrieveAnInquirySession",
      );

    const result = await runLiveEffect(
      retrieveAnInquirySession({
        inquirySessionId: id,
        personaVersion: PERSONA_VERSION,
      }),
    );
    expect(result.data.id).toBe(id);
  }, 30_000);

  it("returns NotFound for a valid-format missing inquiry session", async () => {
    const failure = await runFailure(
      retrieveAnInquirySession({
        inquirySessionId: missingId("iqse"),
        personaVersion: PERSONA_VERSION,
      }),
    );
    expect(failure.tag).toBe("NotFound");
  }, 30_000);
});
