import { beforeAll, describe, expect, it } from "vitest";
import { accountsAddTag } from "../../src/operations/accountsAddTag.ts";
import { accountsSetAllTags } from "../../src/operations/accountsSetAllTags.ts";
import { retrieveAnAccount } from "../../src/operations/retrieveAnAccount.ts";
import { withOwnedAccount } from "../account-fixture.ts";
import {
  idempotencyKey,
  ownedName,
  PERSONA_VERSION,
  missingId,
} from "../fixtures.ts";
import { runFailure, runLiveEffect } from "../safe-run.ts";
import { beginLiveTestRun } from "../setup.ts";

// Coverage: live-lifecycle
describe("accountsSetAllTags", () => {
  beforeAll(beginLiveTestRun);

  it("replaces all tags on an owned account", async () => {
    await withOwnedAccount("set-tags", async ({ id }) => {
      const tag = ownedName("tag", "set");
      await runLiveEffect(
        accountsAddTag({
          accountId: id,
          idempotencyKey: idempotencyKey("account-add-tag", "set"),
          personaVersion: PERSONA_VERSION,
          meta: { "tag-name": tag },
        }),
      );
      await runLiveEffect(
        accountsSetAllTags({
          accountId: id,
          idempotencyKey: idempotencyKey("account-set-tags", "set"),
          personaVersion: PERSONA_VERSION,
          meta: { "tag-name": [tag] },
        }),
      );
      const retrieved = await runLiveEffect(
        retrieveAnAccount({ accountId: id, personaVersion: PERSONA_VERSION }),
      );
      expect((retrieved.data.attributes?.tags ?? []).map(String)).toEqual([
        tag.toUpperCase(),
      ]);
    });
  }, 30_000);

  it("returns NotFound for a valid-format missing account", async () => {
    const failure = await runFailure(
      accountsSetAllTags({
        accountId: missingId("act"),
        idempotencyKey: idempotencyKey("account-set-tags", "missing"),
        personaVersion: PERSONA_VERSION,
        meta: { "tag-name": [ownedName("tag", "missing-account")] },
      }),
    );
    expect(failure.tag).toBe("NotFound");
  }, 30_000);
});
