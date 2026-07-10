import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { retrieveAnAccountType } from "../src/operations/retrieveAnAccountType.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  accountTypeId: "accounttypeid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-retrieveAnAccountType",
} as any;

describe("retrieveAnAccountType", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        retrieveAnAccountType(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
