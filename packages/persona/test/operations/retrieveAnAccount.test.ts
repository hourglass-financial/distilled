import { beforeAll, describe, expect, it } from "vitest";
import { retrieveAnAccount } from "../../src/operations/retrieveAnAccount.ts";
import { withOwnedAccount } from "../account-fixture.ts";
import { missingId, PERSONA_VERSION, syntheticIdentity } from "../fixtures.ts";
import { runFailure, runLiveEffect } from "../safe-run.ts";
import { beginLiveTestRun } from "../setup.ts";

// Coverage: live-data
describe("retrieveAnAccount", () => {
  beforeAll(beginLiveTestRun);

  it("retrieves an owned account and decodes its fields", async () => {
    await withOwnedAccount("retrieve", async ({ id, referenceId }) => {
      const result = await runLiveEffect(
        retrieveAnAccount({ accountId: id, personaVersion: PERSONA_VERSION }),
      );
      expect(result.data.id).toBe(id);
      expect(result.data.attributes?.["reference-id"]).toBe(referenceId);
      expect(result.data.attributes?.fields?.name?.value?.first?.value).toBe(
        syntheticIdentity.firstName,
      );
    });
  }, 30_000);

  it("returns NotFound for a valid-format missing id", async () => {
    const failure = await runFailure(
      retrieveAnAccount({
        accountId: missingId("act"),
        personaVersion: PERSONA_VERSION,
      }),
    );
    expect(failure.tag).toBe("NotFound");
  }, 30_000);
});
