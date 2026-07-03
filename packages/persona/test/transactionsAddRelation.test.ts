import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { transactionsAddRelation } from "../src/operations/transactionsAddRelation.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  transactionId: "transactionid_distilled_missing",
  meta: {
    "relation-schema-key": "distilled-persona-relation-schema-key",
    "target-object-id": "target_object_id_distilled_missing",
  },
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-transactionsAddRelation",
} as any;

describe("transactionsAddRelation", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        transactionsAddRelation(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
