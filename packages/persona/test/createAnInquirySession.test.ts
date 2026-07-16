import { beforeAll, describe, expect, it } from "vitest";
import { createAnInquirySession } from "../src/operations/createAnInquirySession.ts";
import { expireAnInquirySession } from "../src/operations/expireAnInquirySession.ts";
import { idempotencyKey, PERSONA_VERSION } from "./fixtures.ts";
import { withOwnedInquiry } from "./inquiry-fixture.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-lifecycle
describe("createAnInquirySession", () => {
  beforeAll(beginLiveTestRun);

  it("creates and expires a session for an owned inquiry", async () => {
    await withOwnedInquiry("create-session", async ({ id }) => {
      const result = await runLiveEffect(
        createAnInquirySession({
          idempotencyKey: idempotencyKey("create-session", "create"),
          personaVersion: PERSONA_VERSION,
          data: { attributes: { "inquiry-id": id } },
        }),
      );
      const sessionId = result.data.id;
      if (!sessionId)
        throw new Error("Persona created a session without an id");
      expect(sessionId).toMatch(/^iqse_/);
      await runLiveEffect(
        expireAnInquirySession({
          inquirySessionId: sessionId,
          idempotencyKey: idempotencyKey("expire-session", "create"),
          personaVersion: PERSONA_VERSION,
        }),
      );
    });
  }, 60_000);
});
