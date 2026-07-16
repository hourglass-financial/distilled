import { beforeAll, describe, expect, it } from "vitest";
import { accountsAddTag } from "../src/operations/accountsAddTag.ts";
import { accountsRemoveTag } from "../src/operations/accountsRemoveTag.ts";
import { retrieveAnAccount } from "../src/operations/retrieveAnAccount.ts";
import { withOwnedAccount } from "./account-fixture.ts";
import { idempotencyKey, ownedName, PERSONA_VERSION } from "./fixtures.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-lifecycle
describe("accountsRemoveTag", () => {
  beforeAll(beginLiveTestRun);

  it("removes a tag from an owned account", async () => {
    await withOwnedAccount("remove-tag", async ({ id }) => {
      const tag = ownedName("tag", "remove");
      await runLiveEffect(
        accountsAddTag({
          accountId: id,
          idempotencyKey: idempotencyKey("account-add-tag", "remove"),
          personaVersion: PERSONA_VERSION,
          meta: { "tag-name": tag },
        }),
      );
      await runLiveEffect(
        accountsRemoveTag({
          accountId: id,
          idempotencyKey: idempotencyKey("account-remove-tag", "remove"),
          personaVersion: PERSONA_VERSION,
          meta: { "tag-name": tag },
        }),
      );
      const retrieved = await runLiveEffect(
        retrieveAnAccount({ accountId: id, personaVersion: PERSONA_VERSION }),
      );
      expect((retrieved.data.attributes?.tags ?? []).map(String)).not.toContain(
        tag.toUpperCase(),
      );
    });
  }, 30_000);
});
