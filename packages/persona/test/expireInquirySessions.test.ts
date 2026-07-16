import { beforeAll, describe, expect, it } from "vitest";
import { expireInquirySessions } from "../src/operations/expireInquirySessions.ts";
import { idempotencyKey, PERSONA_VERSION } from "./fixtures.ts";
import { withOwnedInquirySession } from "./inquiry-fixture.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-lifecycle
describe("expireInquirySessions", () => {
  beforeAll(beginLiveTestRun);

  it("expires every session on an owned inquiry", async () => {
    await withOwnedInquirySession(
      "expire-sessions",
      async ({ id, sessionId }) => {
        const result = await runLiveEffect(
          expireInquirySessions({
            idempotencyKey: idempotencyKey("expire-sessions", "all"),
            personaVersion: PERSONA_VERSION,
            meta: { "inquiry-ids": [id] },
          }),
        );
        expect(result.data.map((session) => session.id)).toContain(sessionId);
        expect(
          result.data.find((session) => session.id === sessionId)?.attributes
            ?.status,
        ).toBe("expired");
      },
    );
  }, 60_000);
});
