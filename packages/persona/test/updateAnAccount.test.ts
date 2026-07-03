import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { updateAnAccount } from "../src/operations/updateAnAccount.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  accountId: "accountid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-updateAnAccount",
} as any;

describe("updateAnAccount", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        updateAnAccount(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
