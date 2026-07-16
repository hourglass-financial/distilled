import { beforeAll, describe, expect, it } from "vitest";
import { searchAccounts } from "../src/operations/searchAccounts.ts";
import { idempotencyKey, PERSONA_VERSION } from "./fixtures.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-data
describe("searchAccounts", () => {
  beforeAll(beginLiveTestRun);

  it("searches the populated sandbox and decodes an account", async () => {
    const result = await runLiveEffect(
      searchAccounts({
        idempotencyKey: idempotencyKey("search-accounts", "populated"),
        page: { size: 1 },
        personaVersion: PERSONA_VERSION,
        query: {
          attribute: "created_at",
          operator: "gte",
          value: "2020-01-01",
        },
        sort: { attribute: "created_at", direction: "desc" },
      }),
    );
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]?.id).toMatch(/^act_/);
  }, 30_000);
});
