import { beforeAll, describe, expect, it } from "vitest";
import { redactAnAccount } from "../../src/operations/redactAnAccount.ts";
import { withOwnedAccount } from "../account-fixture.ts";
import { idempotencyKey, PERSONA_VERSION, missingId } from "../fixtures.ts";
import { runFailure, runLiveEffect } from "../safe-run.ts";
import { beginLiveTestRun } from "../setup.ts";

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

  it("returns NotFound for a valid-format missing account", async () => {
    const failure = await runFailure(
      redactAnAccount({
        accountId: missingId("act"),
        idempotencyKey: idempotencyKey("redact-account", "missing"),
        personaVersion: PERSONA_VERSION,
      }),
    );
    expect(failure.tag).toBe("NotFound");
  }, 30_000);
});
