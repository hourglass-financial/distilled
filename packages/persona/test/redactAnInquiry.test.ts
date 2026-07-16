import { beforeAll, describe, expect, it } from "vitest";
import { redactAnInquiry } from "../src/operations/redactAnInquiry.ts";
import { idempotencyKey, PERSONA_VERSION } from "./fixtures.ts";
import { withOwnedInquiry } from "./inquiry-fixture.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-lifecycle
describe("redactAnInquiry", () => {
  beforeAll(beginLiveTestRun);

  it("redacts an owned inquiry", async () => {
    await withOwnedInquiry("redact", async ({ id, markTerminal }) => {
      const result = await runLiveEffect(
        redactAnInquiry({
          inquiryId: id,
          idempotencyKey: idempotencyKey("redact-inquiry", "redact"),
          personaVersion: PERSONA_VERSION,
        }),
      );
      markTerminal();
      expect(result.data.attributes["redacted-at"]).toBeTruthy();
    });
  }, 60_000);
});
