import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { reactivateAConnectConnection } from "../src/operations/reactivateAConnectConnection.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  connectionId: "connectionid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-reactivateAConnectConnection",
} as any;

describe("reactivateAConnectConnection", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        reactivateAConnectConnection(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
