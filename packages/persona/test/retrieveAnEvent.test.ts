import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { retrieveAnEvent } from "../src/operations/retrieveAnEvent.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  eventId: "eventid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-retrieveAnEvent",
} as any;

describe("retrieveAnEvent", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        retrieveAnEvent(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
