import { beforeAll, describe, expect, it } from "vitest";
import { createAnInquiry } from "../../src/operations/createAnInquiry.ts";
import { idempotencyKey, missingId, PERSONA_VERSION } from "../fixtures.ts";
import { templateSelector, withInquiryCleanup } from "../inquiry-fixture.ts";
import { runFailure, runLiveEffect } from "../safe-run.ts";
import { beginLiveTestRun } from "../setup.ts";

// Coverage: live-lifecycle
describe("createAnInquiry", () => {
  beforeAll(beginLiveTestRun);

  it("creates an owned inquiry with a configured custom field", async () => {
    await withInquiryCleanup("create", async (fixture) => {
      const result = await runLiveEffect(
        createAnInquiry({
          idempotencyKey: idempotencyKey("create-inquiry", "create"),
          personaVersion: PERSONA_VERSION,
          data: {
            attributes: {
              ...templateSelector(fixture.fixture.templateId),
              "reference-id": fixture.referenceId,
              note: fixture.referenceId,
              fields: {
                [fixture.fixture.fieldName]: fixture.fixture.fieldValue,
              },
            },
          },
          meta: { "auto-create-account": false },
        }),
      );
      fixture.registerCreatedId(result.data.id);
      expect(result.data.id).toMatch(/^inq_/);
      expect(
        result.data.attributes.fields[fixture.fixture.fieldName],
      ).toMatchObject({
        type: "string",
        value: fixture.fixture.fieldValue,
      });
    });
  }, 60_000);

  it("returns BadRequest for a missing inquiry template", async () => {
    await withInquiryCleanup("missing-template", async (fixture) => {
      const failure = await runFailure(
        createAnInquiry({
          idempotencyKey: idempotencyKey("create-inquiry", "missing-template"),
          personaVersion: PERSONA_VERSION,
          data: {
            attributes: {
              ...templateSelector(missingId("itmpl")),
              "reference-id": fixture.referenceId,
            },
          },
          meta: { "auto-create-account": false },
        }),
      );
      expect(failure.tag).toBe("BadRequest");
    });
  }, 60_000);
});
