import { beforeAll, describe, expect, it } from "vitest";
import { retrieveAnInquiry } from "../src/operations/retrieveAnInquiry.ts";
import { missingId, PERSONA_VERSION } from "./fixtures.ts";
import { withOwnedInquiry } from "./inquiry-fixture.ts";
import { runFailure, runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-data
describe("retrieveAnInquiry", () => {
  beforeAll(beginLiveTestRun);

  it("preserves a configured custom field through output decoding", async () => {
    await withOwnedInquiry("retrieve", async ({ id, fixture }) => {
      const result = await runLiveEffect(
        retrieveAnInquiry({ inquiryId: id, personaVersion: PERSONA_VERSION }),
      );
      expect(result.data.attributes.fields[fixture.fieldName]).toMatchObject({
        type: "string",
        value: fixture.fieldValue,
      });
    });
  }, 60_000);

  it("returns NotFound for a valid-format missing id", async () => {
    const failure = await runFailure(
      retrieveAnInquiry({
        inquiryId: missingId("inq"),
        personaVersion: PERSONA_VERSION,
      }),
    );
    expect(failure.tag).toBe("NotFound");
  }, 30_000);
});
