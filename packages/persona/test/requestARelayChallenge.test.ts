import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { requestARelayChallenge } from "../src/operations/requestARelayChallenge.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  "claim-type": "distilled-persona-claim-type",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-requestARelayChallenge",
} as any;

describe("requestARelayChallenge", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        requestARelayChallenge(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
