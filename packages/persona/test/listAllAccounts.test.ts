import { beforeAll, describe, expect, it } from "vitest";
import { listAllAccounts } from "../src/operations/listAllAccounts.ts";
import { withOwnedAccount } from "./account-fixture.ts";
import { PERSONA_VERSION } from "./fixtures.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-data
describe("listAllAccounts", () => {
  beforeAll(beginLiveTestRun);

  it("filters the authenticated collection to an owned account", async () => {
    await withOwnedAccount("list", async ({ id, referenceId }) => {
      const result = await runLiveEffect(
        listAllAccounts({
          filter: { "reference-id": referenceId },
          page: { size: 10 },
          personaVersion: PERSONA_VERSION,
        }),
      );
      expect(result.data.map((account) => account.id)).toContain(id);
      expect(result.links).toBeDefined();
    });
  }, 30_000);
});
