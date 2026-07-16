import { beforeAll, describe, expect, it } from "vitest";
import { generateAOneTimeLinkForAnInquirySession } from "../src/operations/generateAOneTimeLinkForAnInquirySession.ts";
import { idempotencyKey, PERSONA_VERSION } from "./fixtures.ts";
import { withOwnedInquirySession } from "./inquiry-fixture.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-lifecycle
describe("generateAOneTimeLinkForAnInquirySession", () => {
  beforeAll(beginLiveTestRun);

  it("generates one-time links for an owned inquiry session", async () => {
    await withOwnedInquirySession("session-link", async ({ sessionId }) => {
      const result = await runLiveEffect(
        generateAOneTimeLinkForAnInquirySession({
          inquirySessionId: sessionId,
          idempotencyKey: idempotencyKey("session-link", "generate"),
          personaVersion: PERSONA_VERSION,
        }),
      );
      expect(result.data.id).toBe(sessionId);
      expect(typeof result.meta["one-time-link"] === "string").toBe(true);
      expect(typeof result.meta["one-time-link-short"] === "string").toBe(true);
    });
  }, 60_000);
});
