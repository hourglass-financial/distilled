import { beforeAll, describe, expect, it } from "vitest";
import { expireAnInquiry } from "../../src/operations/expireAnInquiry.ts";
import { idempotencyKey, PERSONA_VERSION, missingId } from "../fixtures.ts";
import { withOwnedInquiry } from "../inquiry-fixture.ts";
import { runFailure, runLiveEffect } from "../safe-run.ts";
import { beginLiveTestRun } from "../setup.ts";

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

  it("returns NotFound for a valid-format missing inquiry", async () => {
    const failure = await runFailure(
      expireAnInquiry({
        inquiryId: missingId("inq"),
        idempotencyKey: idempotencyKey("expire-inquiry", "missing"),
        personaVersion: PERSONA_VERSION,
      }),
    );
    expect(failure.tag).toBe("NotFound");
  }, 30_000);

  it("returns Conflict when an inquiry is expired twice", async () => {
    await withOwnedInquiry("expire-twice", async ({ id }) => {
      await runLiveEffect(
        expireAnInquiry({
          inquiryId: id,
          idempotencyKey: idempotencyKey("expire-inquiry", "first"),
          personaVersion: PERSONA_VERSION,
        }),
      );
      const failure = await runFailure(
        expireAnInquiry({
          inquiryId: id,
          idempotencyKey: idempotencyKey("expire-inquiry", "second"),
          personaVersion: PERSONA_VERSION,
        }),
      );
      expect(failure.tag).toBe("Conflict");
    });
  }, 60_000);
});
