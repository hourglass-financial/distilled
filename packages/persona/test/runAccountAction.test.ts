import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { runAccountAction } from "../src/operations/runAccountAction.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  accountId: "accountid_distilled_missing",
  data: {
    "account-action-id": "account_action_id_distilled_missing",
  },
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-runAccountAction",
} as any;

describe("runAccountAction", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        runAccountAction(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
