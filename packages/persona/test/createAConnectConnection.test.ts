import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createAConnectConnection } from "../src/operations/createAConnectConnection.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createAConnectConnection",
} as any;

describe("createAConnectConnection", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createAConnectConnection(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
