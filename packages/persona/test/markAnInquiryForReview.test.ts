import { beforeAll, describe, expect, it } from "vitest";
import { markAnInquiryForReview } from "../src/operations/markAnInquiryForReview.ts";
import { idempotencyKey, PERSONA_VERSION } from "./fixtures.ts";
import { withOwnedInquiry } from "./inquiry-fixture.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-lifecycle
describe("markAnInquiryForReview", () => {
  beforeAll(beginLiveTestRun);

  it("marks an owned inquiry for review", async () => {
    await withOwnedInquiry("review", async ({ id }) => {
      const result = await runLiveEffect(
        markAnInquiryForReview({
          inquiryId: id,
          idempotencyKey: idempotencyKey("review-inquiry", "review"),
          personaVersion: PERSONA_VERSION,
        }),
      );
      expect(result.data.attributes.status).toBe("needs_review");
    });
  }, 60_000);
});
