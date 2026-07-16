import { beforeAll, describe, expect, it } from "vitest";
import { retrieveAnAccount } from "../src/operations/retrieveAnAccount.ts";
import { updateAnAccount } from "../src/operations/updateAnAccount.ts";
import { withOwnedAccount } from "./account-fixture.ts";
import { idempotencyKey, PERSONA_VERSION } from "./fixtures.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-lifecycle
describe("updateAnAccount", () => {
  beforeAll(beginLiveTestRun);

  it("updates an owned account and verifies the persisted field", async () => {
    await withOwnedAccount("update", async ({ id, referenceId }) => {
      const lastName = `Updated-${referenceId.slice(-8)}`;
      const result = await runLiveEffect(
        updateAnAccount({
          accountId: id,
          idempotencyKey: idempotencyKey("update-account", "update"),
          personaVersion: PERSONA_VERSION,
          data: { attributes: { "name-last": lastName } },
        }),
      );
      expect(result.data.id).toBe(id);

      const retrieved = await runLiveEffect(
        retrieveAnAccount({ accountId: id, personaVersion: PERSONA_VERSION }),
      );
      expect(retrieved.data.attributes?.fields?.name?.value?.last?.value).toBe(
        lastName,
      );
    });
  }, 30_000);
});
