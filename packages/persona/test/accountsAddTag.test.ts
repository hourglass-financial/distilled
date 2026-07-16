import { beforeAll, describe, expect, it } from "vitest";
import { accountsAddTag } from "../src/operations/accountsAddTag.ts";
import { retrieveAnAccount } from "../src/operations/retrieveAnAccount.ts";
import { withOwnedAccount } from "./account-fixture.ts";
import { idempotencyKey, ownedName, PERSONA_VERSION } from "./fixtures.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-lifecycle
describe("accountsAddTag", () => {
  beforeAll(beginLiveTestRun);

  it("adds a tag to an owned account", async () => {
    await withOwnedAccount("add-tag", async ({ id }) => {
      const tag = ownedName("tag", "add");
      await runLiveEffect(
        accountsAddTag({
          accountId: id,
          idempotencyKey: idempotencyKey("account-add-tag", "add"),
          personaVersion: PERSONA_VERSION,
          meta: { "tag-name": tag },
        }),
      );
      const retrieved = await runLiveEffect(
        retrieveAnAccount({ accountId: id, personaVersion: PERSONA_VERSION }),
      );
      expect((retrieved.data.attributes?.tags ?? []).map(String)).toContain(
        tag.toUpperCase(),
      );
    });
  }, 30_000);
});
