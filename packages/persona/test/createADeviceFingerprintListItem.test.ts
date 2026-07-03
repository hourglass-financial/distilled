import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createADeviceFingerprintListItem } from "../src/operations/createADeviceFingerprintListItem.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createADeviceFingerprintListItem",
} as any;

describe("createADeviceFingerprintListItem", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createADeviceFingerprintListItem(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
