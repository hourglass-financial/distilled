import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { accountsRemoveTag } from "../src/operations/accountsRemoveTag.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  accountId: "accountid_distilled_missing",
  meta: {},
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-accountsRemoveTag",
} as any;

describe("accountsRemoveTag", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        accountsRemoveTag(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
