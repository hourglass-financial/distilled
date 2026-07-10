import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { retrieveATransactionType } from "../src/operations/retrieveATransactionType.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  transactionTypeId: "transactiontypeid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-retrieveATransactionType",
} as any;

describe("retrieveATransactionType", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        retrieveATransactionType(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
