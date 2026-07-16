import { beforeAll, describe, expect, it } from "vitest";
import { retrieveAnInquiry } from "../../src/operations/retrieveAnInquiry.ts";
import { updateAnInquiry } from "../../src/operations/updateAnInquiry.ts";
import {
  idempotencyKey,
  ownedName,
  PERSONA_VERSION,
  missingId,
} from "../fixtures.ts";
import { withOwnedInquiry } from "../inquiry-fixture.ts";
import { runFailure, runLiveEffect } from "../safe-run.ts";
import { beginLiveTestRun, testRunId } from "../setup.ts";

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

  it("returns NotFound for a valid-format missing inquiry", async () => {
    const failure = await runFailure(
      updateAnInquiry({
        inquiryId: missingId("inq"),
        idempotencyKey: idempotencyKey("update-inquiry", "missing"),
        personaVersion: PERSONA_VERSION,
        data: { attributes: { fields: {} } },
      }),
    );
    expect(failure.tag).toBe("NotFound");
  }, 30_000);

  it("returns BadRequest for an undeclared template field", async () => {
    await withOwnedInquiry("update-unknown-field", async ({ id }) => {
      const failure = await runFailure(
        updateAnInquiry({
          inquiryId: id,
          idempotencyKey: idempotencyKey("update-inquiry", "unknown-field"),
          personaVersion: PERSONA_VERSION,
          data: {
            attributes: {
              fields: { [`distilled_unknown_${testRunId}`]: "value" },
            },
          },
        }),
      );
      expect(failure.tag).toBe("BadRequest");
    });
  }, 60_000);

  it("returns BadRequest for the wrong custom-field value type", async () => {
    await withOwnedInquiry(
      "update-wrong-field-type",
      async ({ id, fixture }) => {
        const failure = await runFailure(
          updateAnInquiry({
            inquiryId: id,
            idempotencyKey: idempotencyKey("update-inquiry", "wrong-type"),
            personaVersion: PERSONA_VERSION,
            data: { attributes: { fields: { [fixture.fieldName]: 42 } } },
          }),
        );
        expect(failure.tag).toBe("BadRequest");
      },
    );
  }, 60_000);
});
