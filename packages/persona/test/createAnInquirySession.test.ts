import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createAnInquirySession } from "../src/operations/createAnInquirySession.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createAnInquirySession",
} as any;

describe("createAnInquirySession", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createAnInquirySession(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
