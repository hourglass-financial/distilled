import { beforeAll, describe, expect, it } from "vitest";
import { approveAnInquiry } from "../../src/operations/approveAnInquiry.ts";
import { idempotencyKey, PERSONA_VERSION, missingId } from "../fixtures.ts";
import { withOwnedInquiry } from "../inquiry-fixture.ts";
import { runFailure, runLiveEffect } from "../safe-run.ts";
import { beginLiveTestRun } from "../setup.ts";

// Coverage: live-lifecycle
describe("approveAnInquiry", () => {
  beforeAll(beginLiveTestRun);

  it("approves an owned inquiry", async () => {
    await withOwnedInquiry("approve", async ({ id }) => {
      const result = await runLiveEffect(
        approveAnInquiry({
          inquiryId: id,
          idempotencyKey: idempotencyKey("approve-inquiry", "approve"),
          personaVersion: PERSONA_VERSION,
          meta: { comment: "Distilled live test" },
        }),
      );
      expect(result.data.attributes.status).toBe("approved");
    });
  }, 60_000);

  it("returns NotFound for a valid-format missing inquiry", async () => {
    const failure = await runFailure(
      approveAnInquiry({
        inquiryId: missingId("inq"),
        idempotencyKey: idempotencyKey("approve-inquiry", "missing"),
        personaVersion: PERSONA_VERSION,
        meta: { comment: "Distilled missing inquiry test" },
      }),
    );
    expect(failure.tag).toBe("NotFound");
  }, 30_000);

  it("returns Conflict when an inquiry is approved twice", async () => {
    await withOwnedInquiry("approve-twice", async ({ id }) => {
      await runLiveEffect(
        approveAnInquiry({
          inquiryId: id,
          idempotencyKey: idempotencyKey("approve-inquiry", "first"),
          personaVersion: PERSONA_VERSION,
        }),
      );
      const failure = await runFailure(
        approveAnInquiry({
          inquiryId: id,
          idempotencyKey: idempotencyKey("approve-inquiry", "second"),
          personaVersion: PERSONA_VERSION,
        }),
      );
      expect(failure.tag).toBe("Conflict");
    });
  }, 60_000);
});
