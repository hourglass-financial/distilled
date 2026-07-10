import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createACase } from "../src/operations/createACase.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  data: {},
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createACase",
} as any;

describe("createACase", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createACase(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
