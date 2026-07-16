import { beforeAll, describe, expect, it } from "vitest";
import { declineAnInquiry } from "../../src/operations/declineAnInquiry.ts";
import { idempotencyKey, PERSONA_VERSION, missingId } from "../fixtures.ts";
import { withOwnedInquiry } from "../inquiry-fixture.ts";
import { runFailure, runLiveEffect } from "../safe-run.ts";
import { beginLiveTestRun } from "../setup.ts";

// Coverage: live-lifecycle
describe("declineAnInquiry", () => {
  beforeAll(beginLiveTestRun);

  it("declines an owned inquiry", async () => {
    await withOwnedInquiry("decline", async ({ id }) => {
      const result = await runLiveEffect(
        declineAnInquiry({
          inquiryId: id,
          idempotencyKey: idempotencyKey("decline-inquiry", "decline"),
          personaVersion: PERSONA_VERSION,
          meta: { comment: "Distilled live test" },
        }),
      );
      expect(result.data.attributes.status).toBe("declined");
    });
  }, 60_000);

  it("returns NotFound for a valid-format missing inquiry", async () => {
    const failure = await runFailure(
      declineAnInquiry({
        inquiryId: missingId("inq"),
        idempotencyKey: idempotencyKey("decline-inquiry", "missing"),
        personaVersion: PERSONA_VERSION,
        meta: { comment: "Distilled missing inquiry test" },
      }),
    );
    expect(failure.tag).toBe("NotFound");
  }, 30_000);
});
