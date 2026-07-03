import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createARelay } from "../src/operations/createARelay.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  "claim-type": "distilled-persona-claim-type",
  "encryption-key-pem": "distilled-persona-encryption-key-pem",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createARelay",
} as any;

describe("createARelay", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createARelay(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
