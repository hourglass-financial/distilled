import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createAPhoneNumberList } from "../src/operations/createAPhoneNumberList.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createAPhoneNumberList",
} as any;

describe("createAPhoneNumberList", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createAPhoneNumberList(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
