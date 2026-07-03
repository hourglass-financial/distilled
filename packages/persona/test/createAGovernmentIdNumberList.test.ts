import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createAGovernmentIdNumberList } from "../src/operations/createAGovernmentIdNumberList.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createAGovernmentIdNumberList",
} as any;

describe("createAGovernmentIdNumberList", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createAGovernmentIdNumberList(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
