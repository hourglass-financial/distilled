import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { retrieveAConnectConnection } from "../src/operations/retrieveAConnectConnection.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  connectionId: "connectionid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-retrieveAConnectConnection",
} as any;

describe("retrieveAConnectConnection", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        retrieveAConnectConnection(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
