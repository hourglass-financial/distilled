import { beforeAll, describe, expect, it } from "vitest";
import { generateAOneTimeLink } from "../src/operations/generateAOneTimeLink.ts";
import { idempotencyKey, PERSONA_VERSION } from "./fixtures.ts";
import { withOwnedInquiry } from "./inquiry-fixture.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-lifecycle
describe("generateAOneTimeLink", () => {
  beforeAll(beginLiveTestRun);

  it("generates one-time links for an owned inquiry without exposing them", async () => {
    await withOwnedInquiry("one-time-link", async ({ id }) => {
      const result = await runLiveEffect(
        generateAOneTimeLink({
          inquiryId: id,
          idempotencyKey: idempotencyKey("one-time-link", "generate"),
          personaVersion: PERSONA_VERSION,
          meta: { "expires-in-seconds": 60 },
        }),
      );
      expect(result.data.id).toBe(id);
      expect(typeof result.meta["one-time-link"] === "string").toBe(true);
      expect(typeof result.meta["one-time-link-short"] === "string").toBe(true);
    });
  }, 60_000);
});
