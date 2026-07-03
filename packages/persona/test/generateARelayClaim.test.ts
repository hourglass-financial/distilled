import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { generateARelayClaim } from "../src/operations/generateARelayClaim.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  relayToken: "distilled-persona-relaytoken",
  personaRelaySecret: "distilled-persona-personarelaysecret",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-generateARelayClaim",
} as any;

describe("generateARelayClaim", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        generateARelayClaim(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
