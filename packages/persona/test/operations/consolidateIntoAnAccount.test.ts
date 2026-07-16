import { beforeAll, describe, expect, it } from "vitest";
import { consolidateIntoAnAccount } from "../../src/operations/consolidateIntoAnAccount.ts";
import { retrieveAnAccount } from "../../src/operations/retrieveAnAccount.ts";
import { withOwnedAccount } from "../account-fixture.ts";
import { idempotencyKey, PERSONA_VERSION, missingId } from "../fixtures.ts";
import { runFailure, runLiveEffect } from "../safe-run.ts";
import { beginLiveTestRun } from "../setup.ts";

// Coverage: live-lifecycle
describe("consolidateIntoAnAccount", () => {
  beforeAll(beginLiveTestRun);

  it("consolidates one owned account into another", async () => {
    await withOwnedAccount("consolidate-target", async (target) => {
      await withOwnedAccount("consolidate-source", async (source) => {
        await runLiveEffect(
          consolidateIntoAnAccount({
            accountId: target.id,
            idempotencyKey: idempotencyKey("consolidate-account", "owned"),
            personaVersion: PERSONA_VERSION,
            meta: { "source-account-ids": [source.id] },
          }),
        );
        const retrieved = await runLiveEffect(
          retrieveAnAccount({
            accountId: target.id,
            personaVersion: PERSONA_VERSION,
          }),
        );
        expect(retrieved.data.id).toBe(target.id);
      });
    });
  }, 60_000);

  it("returns NotFound for a valid-format missing target account", async () => {
    const failure = await runFailure(
      consolidateIntoAnAccount({
        accountId: missingId("act"),
        idempotencyKey: idempotencyKey("consolidate-account", "missing"),
        personaVersion: PERSONA_VERSION,
        meta: { "source-account-ids": [missingId("act-source")] },
      }),
    );
    expect(failure.tag).toBe("NotFound");
  }, 30_000);
});
