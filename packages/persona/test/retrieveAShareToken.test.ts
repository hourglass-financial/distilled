import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { retrieveAShareToken } from "../src/operations/retrieveAShareToken.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  shareTokenId: "sharetokenid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-retrieveAShareToken",
} as any;

describe("retrieveAShareToken", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        retrieveAShareToken(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
