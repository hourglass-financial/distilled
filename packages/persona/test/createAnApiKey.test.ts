import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createAnApiKey } from "../src/operations/createAnApiKey.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  data: {
    attributes: {
      name: "distilled-persona-api-key",
    },
  },
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createAnApiKey",
} as any;

describe("createAnApiKey", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createAnApiKey(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
