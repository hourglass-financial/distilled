import { beforeAll, describe, expect, it } from "vitest";
import { inquiriesPerformSimulateActions } from "../src/operations/inquiriesPerformSimulateActions.ts";
import { idempotencyKey, PERSONA_VERSION } from "./fixtures.ts";
import { withOwnedInquiry } from "./inquiry-fixture.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-lifecycle
describe("inquiriesPerformSimulateActions", () => {
  beforeAll(beginLiveTestRun);

  it("simulates a terminal action on an owned sandbox inquiry", async () => {
    await withOwnedInquiry("simulate", async ({ id }) => {
      const result = await runLiveEffect(
        inquiriesPerformSimulateActions({
          inquiryId: id,
          idempotencyKey: idempotencyKey("simulate-inquiry", "expire"),
          personaVersion: PERSONA_VERSION,
          meta: { "simulate-actions": [{ type: "expire_inquiry" }] },
        }),
      );
      expect(result.data.id).toBe(id);
      expect(result.data.attributes.status).toBe("expired");
    });
  }, 60_000);
});
