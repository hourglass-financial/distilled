import { beforeAll, describe, expect, it } from "vitest";
import { listAllEvents } from "../src/operations/listAllEvents.ts";
import { retrieveAnEvent } from "../src/operations/retrieveAnEvent.ts";
import { PERSONA_VERSION } from "./fixtures.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-data
describe("retrieveAnEvent", () => {
  beforeAll(beginLiveTestRun);

  it("retrieves and decodes a resource exposed by the sandbox", async () => {
    const listed = await runLiveEffect(
      listAllEvents({ page: { size: 1 }, personaVersion: PERSONA_VERSION }),
    );
    const id = listed.data[0]?.id;
    if (!id)
      throw new Error("Persona sandbox fixture is missing for retrieveAnEvent");

    const result = await runLiveEffect(
      retrieveAnEvent({ eventId: id, personaVersion: PERSONA_VERSION }),
    );
    expect(result.data.id).toBe(id);
  }, 30_000);
});
