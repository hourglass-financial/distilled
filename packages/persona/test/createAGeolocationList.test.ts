import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createAGeolocationList } from "../src/operations/createAGeolocationList.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createAGeolocationList",
} as any;

describe("createAGeolocationList", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createAGeolocationList(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
