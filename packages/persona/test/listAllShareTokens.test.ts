import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { listAllShareTokens } from "../src/operations/listAllShareTokens.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-listAllShareTokens",
} as any;

describe("listAllShareTokens", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        listAllShareTokens(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
