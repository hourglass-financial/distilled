import { beforeAll, describe, expect, it } from "vitest";
import { retrieveAnInquiry } from "../src/operations/retrieveAnInquiry.ts";
import { updateAnInquiry } from "../src/operations/updateAnInquiry.ts";
import { idempotencyKey, ownedName, PERSONA_VERSION } from "./fixtures.ts";
import { withOwnedInquiry } from "./inquiry-fixture.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-lifecycle
describe("updateAnInquiry", () => {
  beforeAll(beginLiveTestRun);

  it("updates an owned inquiry and preserves its custom field", async () => {
    await withOwnedInquiry("update", async ({ id, fixture }) => {
      const value = ownedName("field", "updated");
      await runLiveEffect(
        updateAnInquiry({
          inquiryId: id,
          idempotencyKey: idempotencyKey("update-inquiry", "update"),
          personaVersion: PERSONA_VERSION,
          data: { attributes: { fields: { [fixture.fieldName]: value } } },
        }),
      );
      const retrieved = await runLiveEffect(
        retrieveAnInquiry({ inquiryId: id, personaVersion: PERSONA_VERSION }),
      );
      expect(retrieved.data.attributes.fields[fixture.fieldName]).toMatchObject(
        {
          type: "string",
          value,
        },
      );
    });
  }, 60_000);
});
