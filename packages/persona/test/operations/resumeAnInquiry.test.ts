import { beforeAll, describe, expect, it } from "vitest";
import { expireAnInquiry } from "../../src/operations/expireAnInquiry.ts";
import { resumeAnInquiry } from "../../src/operations/resumeAnInquiry.ts";
import { idempotencyKey, PERSONA_VERSION, missingId } from "../fixtures.ts";
import { withOwnedInquiry } from "../inquiry-fixture.ts";
import { runFailure, runLiveEffect } from "../safe-run.ts";
import { beginLiveTestRun } from "../setup.ts";

// Coverage: live-lifecycle
describe("resumeAnInquiry", () => {
  beforeAll(beginLiveTestRun);

  it("resumes an owned expired inquiry and returns a protected session token", async () => {
    await withOwnedInquiry("resume", async ({ id }) => {
      await runLiveEffect(
        expireAnInquiry({
          inquiryId: id,
          idempotencyKey: idempotencyKey("expire-inquiry", "resume"),
          personaVersion: PERSONA_VERSION,
        }),
      );
      const result = await runLiveEffect(
        resumeAnInquiry({
          inquiryId: id,
          idempotencyKey: idempotencyKey("resume-inquiry", "resume"),
          personaVersion: PERSONA_VERSION,
        }),
      );
      expect(result.data.attributes.status).toBe("pending");
      expect(result.meta["session-token"]).toBeDefined();
    });
  }, 60_000);

  it("returns NotFound for a valid-format missing inquiry", async () => {
    const failure = await runFailure(
      resumeAnInquiry({
        inquiryId: missingId("inq"),
        idempotencyKey: idempotencyKey("resume-inquiry", "missing"),
        personaVersion: PERSONA_VERSION,
      }),
    );
    expect(failure.tag).toBe("NotFound");
  }, 30_000);
});
