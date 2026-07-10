import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createAnEmailAddressList } from "../src/operations/createAnEmailAddressList.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createAnEmailAddressList",
} as any;

describe("createAnEmailAddressList", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createAnEmailAddressList(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
