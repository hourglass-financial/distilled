import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createAGeolocationListItem } from "../src/operations/createAGeolocationListItem.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createAGeolocationListItem",
} as any;

describe("createAGeolocationListItem", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createAGeolocationListItem(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
