import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { expireShareToken } from "../src/operations/expireShareToken.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  shareTokenId: "sharetokenid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-expireShareToken",
} as any;

describe("expireShareToken", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        expireShareToken(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
