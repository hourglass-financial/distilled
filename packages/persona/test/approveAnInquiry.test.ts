import { beforeAll, describe, expect, it } from "vitest";
import { approveAnInquiry } from "../src/operations/approveAnInquiry.ts";
import { idempotencyKey, PERSONA_VERSION } from "./fixtures.ts";
import { withOwnedInquiry } from "./inquiry-fixture.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

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
});
