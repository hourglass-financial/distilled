import { beforeAll, describe, expect, it } from "vitest";
import { createAnAccount } from "../../src/operations/createAnAccount.ts";
import { withAccountCleanup } from "../account-fixture.ts";
import {
  idempotencyKey,
  PERSONA_VERSION,
  syntheticIdentity,
} from "../fixtures.ts";
import { runLiveEffect } from "../safe-run.ts";
import { beginLiveTestRun } from "../setup.ts";

// Coverage: live-lifecycle
describe("createAnAccount", () => {
  beforeAll(beginLiveTestRun);

  it("creates an owned account and decodes its standard fields", async () => {
    await withAccountCleanup("create", async (fixture) => {
      const result = await runLiveEffect(
        createAnAccount({
          idempotencyKey: idempotencyKey("create-account", "create"),
          personaVersion: PERSONA_VERSION,
          data: {
            attributes: {
              "reference-id": fixture.referenceId,
              "name-first": syntheticIdentity.firstName,
              "name-last": syntheticIdentity.lastName,
            },
          },
        }),
      );
      const id = result.data.id;
      if (!id) throw new Error("Persona created an account without an id");
      fixture.registerCreatedId(id);
      expect(id).toMatch(/^act_/);
      expect(result.data.attributes?.["reference-id"]).toBe(
        fixture.referenceId,
      );
    });
  }, 30_000);
});
