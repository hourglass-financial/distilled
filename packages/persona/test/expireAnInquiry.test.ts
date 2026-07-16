import { beforeAll, describe, expect, it } from "vitest";
import { expireAnInquiry } from "../src/operations/expireAnInquiry.ts";
import { idempotencyKey, PERSONA_VERSION } from "./fixtures.ts";
import { withOwnedInquiry } from "./inquiry-fixture.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-lifecycle
describe("expireAnInquiry", () => {
  beforeAll(beginLiveTestRun);

  it("expires an owned inquiry", async () => {
    await withOwnedInquiry("expire", async ({ id }) => {
      const result = await runLiveEffect(
        expireAnInquiry({
          inquiryId: id,
          idempotencyKey: idempotencyKey("expire-inquiry", "expire"),
          personaVersion: PERSONA_VERSION,
        }),
      );
      expect(result.data.attributes.status).toBe("expired");
    });
  }, 60_000);
});
