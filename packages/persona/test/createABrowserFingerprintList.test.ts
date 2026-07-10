import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createABrowserFingerprintList } from "../src/operations/createABrowserFingerprintList.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createABrowserFingerprintList",
} as any;

describe("createABrowserFingerprintList", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createABrowserFingerprintList(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
