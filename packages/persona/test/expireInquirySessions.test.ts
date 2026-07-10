import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { expireInquirySessions } from "../src/operations/expireInquirySessions.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-expireInquirySessions",
} as any;

describe("expireInquirySessions", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        expireInquirySessions(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
