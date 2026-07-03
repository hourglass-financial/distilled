import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createAStringsList } from "../src/operations/createAStringsList.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createAStringsList",
} as any;

describe("createAStringsList", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createAStringsList(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
