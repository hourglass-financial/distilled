import { beforeAll, describe, expect, it } from "vitest";
import { listAllWebhooks } from "../src/operations/listAllWebhooks.ts";
import { retrieveAWebhook } from "../src/operations/retrieveAWebhook.ts";
import { PERSONA_VERSION } from "./fixtures.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

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
});
