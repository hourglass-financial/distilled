import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { listAllApiKeys } from "../src/operations/listAllApiKeys.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-listAllApiKeys",
} as any;

describe("listAllApiKeys", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        listAllApiKeys(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
