import { beforeAll, describe, expect, it } from "vitest";
import { declineAnInquiry } from "../src/operations/declineAnInquiry.ts";
import { idempotencyKey, PERSONA_VERSION } from "./fixtures.ts";
import { withOwnedInquiry } from "./inquiry-fixture.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

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
});
