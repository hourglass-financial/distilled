import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { listAllRateLimits } from "../src/operations/listAllRateLimits.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-listAllRateLimits",
} as any;

describe("listAllRateLimits", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        listAllRateLimits(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
