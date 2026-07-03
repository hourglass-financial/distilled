import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { accountsListAllRelations } from "../src/operations/accountsListAllRelations.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  accountId: "accountid_distilled_missing",
  filter: {
    key: "distilled-persona-key",
  },
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-accountsListAllRelations",
} as any;

describe("accountsListAllRelations", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        accountsListAllRelations(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
