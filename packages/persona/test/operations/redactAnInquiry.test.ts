import { beforeAll, describe, expect, it } from "vitest";
import { redactAnInquiry } from "../../src/operations/redactAnInquiry.ts";
import { idempotencyKey, PERSONA_VERSION, missingId } from "../fixtures.ts";
import { withOwnedInquiry } from "../inquiry-fixture.ts";
import { runFailure, runLiveEffect } from "../safe-run.ts";
import { beginLiveTestRun } from "../setup.ts";

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

  it("returns NotFound for a valid-format missing inquiry", async () => {
    const failure = await runFailure(
      redactAnInquiry({
        inquiryId: missingId("inq"),
        idempotencyKey: idempotencyKey("redact-inquiry", "missing"),
        personaVersion: PERSONA_VERSION,
      }),
    );
    expect(failure.tag).toBe("NotFound");
  }, 30_000);
});
