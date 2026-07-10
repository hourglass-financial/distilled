import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createAPhoneNumberListItem } from "../src/operations/createAPhoneNumberListItem.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createAPhoneNumberListItem",
} as any;

describe("createAPhoneNumberListItem", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createAPhoneNumberListItem(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
