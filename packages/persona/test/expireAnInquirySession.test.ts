import { beforeAll, describe, expect, it } from "vitest";
import { expireAnInquirySession } from "../src/operations/expireAnInquirySession.ts";
import { idempotencyKey, PERSONA_VERSION } from "./fixtures.ts";
import { withOwnedInquirySession } from "./inquiry-fixture.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-lifecycle
describe("expireAnInquirySession", () => {
  beforeAll(beginLiveTestRun);

  it("expires an owned inquiry session", async () => {
    await withOwnedInquirySession("expire-session", async ({ sessionId }) => {
      const result = await runLiveEffect(
        expireAnInquirySession({
          inquirySessionId: sessionId,
          idempotencyKey: idempotencyKey("expire-session", "single"),
          personaVersion: PERSONA_VERSION,
        }),
      );
      expect(result.data.id).toBe(sessionId);
      expect(result.data.attributes?.status).toBe("expired");
    });
  }, 60_000);
});
