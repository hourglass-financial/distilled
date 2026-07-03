import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { listAllEvents } from "../src/operations/listAllEvents.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-listAllEvents",
} as any;

describe("listAllEvents", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        listAllEvents(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
