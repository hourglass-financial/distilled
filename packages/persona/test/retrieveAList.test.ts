import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { retrieveAList } from "../src/operations/retrieveAList.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  listId: "listid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-retrieveAList",
} as any;

describe("retrieveAList", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        retrieveAList(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
