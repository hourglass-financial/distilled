import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { transactionsSetTags } from "../src/operations/transactionsSetTags.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  transactionId: "transactionid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-transactionsSetTags",
} as any;

describe("transactionsSetTags", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        transactionsSetTags(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
