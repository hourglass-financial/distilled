import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createAStringListItem } from "../src/operations/createAStringListItem.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createAStringListItem",
} as any;

describe("createAStringListItem", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createAStringListItem(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
