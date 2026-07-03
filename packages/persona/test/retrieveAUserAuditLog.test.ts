import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { retrieveAUserAuditLog } from "../src/operations/retrieveAUserAuditLog.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  userAuditLogId: "userauditlogid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-retrieveAUserAuditLog",
} as any;

describe("retrieveAUserAuditLog", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        retrieveAUserAuditLog(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
