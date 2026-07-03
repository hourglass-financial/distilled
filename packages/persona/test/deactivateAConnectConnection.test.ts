import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { deactivateAConnectConnection } from "../src/operations/deactivateAConnectConnection.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  connectionId: "connectionid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-deactivateAConnectConnection",
} as any;

describe("deactivateAConnectConnection", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        deactivateAConnectConnection(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
