import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createAnIpAddressList } from "../src/operations/createAnIpAddressList.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createAnIpAddressList",
} as any;

describe("createAnIpAddressList", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createAnIpAddressList(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
