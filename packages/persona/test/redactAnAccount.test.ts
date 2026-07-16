import { beforeAll, describe, expect, it } from "vitest";
import { redactAnAccount } from "../src/operations/redactAnAccount.ts";
import { withOwnedAccount } from "./account-fixture.ts";
import { idempotencyKey, PERSONA_VERSION } from "./fixtures.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-lifecycle
describe("redactAnAccount", () => {
  beforeAll(beginLiveTestRun);

  it("redacts an owned account", async () => {
    await withOwnedAccount("redact", async ({ id, markTerminal }) => {
      const result = await runLiveEffect(
        redactAnAccount({
          accountId: id,
          idempotencyKey: idempotencyKey("redact-account", "terminal"),
          personaVersion: PERSONA_VERSION,
        }),
      );
      markTerminal();
      expect(result.data.id).toBe(id);
      expect(result.data.attributes?.["redacted-at"]).toBeTruthy();
    });
  }, 30_000);
});
