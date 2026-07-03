import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { redactAnAccount } from "../src/operations/redactAnAccount.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  accountId: "accountid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-redactAnAccount",
} as any;

describe("redactAnAccount", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        redactAnAccount(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
