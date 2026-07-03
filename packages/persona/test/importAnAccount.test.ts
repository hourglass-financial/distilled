import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { importAnAccount } from "../src/operations/importAnAccount.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  data: {
    attributes: {
      file: {},
    },
  },
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-importAnAccount",
} as any;

describe("importAnAccount", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        importAnAccount(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
