import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { consolidateIntoAnAccount } from "../src/operations/consolidateIntoAnAccount.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  accountId: "accountid_distilled_missing",
  meta: {
    "source-account-ids": [],
  },
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-consolidateIntoAnAccount",
} as any;

describe("consolidateIntoAnAccount", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        consolidateIntoAnAccount(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
