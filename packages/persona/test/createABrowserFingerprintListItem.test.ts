import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createABrowserFingerprintListItem } from "../src/operations/createABrowserFingerprintListItem.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createABrowserFingerprintListItem",
} as any;

describe("createABrowserFingerprintListItem", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createABrowserFingerprintListItem(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
