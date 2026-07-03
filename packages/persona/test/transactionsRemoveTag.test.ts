import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { transactionsRemoveTag } from "../src/operations/transactionsRemoveTag.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  transactionId: "transactionid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-transactionsRemoveTag",
} as any;

describe("transactionsRemoveTag", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        transactionsRemoveTag(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
