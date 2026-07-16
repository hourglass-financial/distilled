import { beforeAll, describe, expect, it } from "vitest";
import { listAllInquirySessions } from "../src/operations/listAllInquirySessions.ts";
import { retrieveAnInquirySession } from "../src/operations/retrieveAnInquirySession.ts";
import { PERSONA_VERSION } from "./fixtures.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

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
});
