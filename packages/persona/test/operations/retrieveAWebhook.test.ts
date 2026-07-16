import { beforeAll, describe, expect, it } from "vitest";
import { listAllWebhooks } from "../../src/operations/listAllWebhooks.ts";
import { retrieveAWebhook } from "../../src/operations/retrieveAWebhook.ts";
import { PERSONA_VERSION, missingId } from "../fixtures.ts";
import { runFailure, runLiveEffect } from "../safe-run.ts";
import { beginLiveTestRun } from "../setup.ts";

// Coverage: live-data
describe("retrieveAWebhook", () => {
  beforeAll(beginLiveTestRun);

  it("retrieves and decodes a resource exposed by the sandbox", async () => {
    const listed = await runLiveEffect(
      listAllWebhooks({ page: { size: 1 }, personaVersion: PERSONA_VERSION }),
    );
    const id = listed.data[0]?.id;
    if (!id)
      throw new Error(
        "Persona sandbox fixture is missing for retrieveAWebhook",
      );

    const result = await runLiveEffect(
      retrieveAWebhook({ webhookId: id, personaVersion: PERSONA_VERSION }),
    );
    expect(result.data.id).toBe(id);
  }, 30_000);

  it("returns NotFound for a valid-format missing webhook", async () => {
    const failure = await runFailure(
      retrieveAWebhook({
        webhookId: missingId("wbh"),
        personaVersion: PERSONA_VERSION,
      }),
    );
    expect(failure.tag).toBe("NotFound");
  }, 30_000);
});
