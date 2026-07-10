import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { retrieveAnApiLog } from "../src/operations/retrieveAnApiLog.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  apiLogId: "apilogid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-retrieveAnApiLog",
} as any;

describe("retrieveAnApiLog", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        retrieveAnApiLog(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
