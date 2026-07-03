import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { listAllUserAuditLogs } from "../src/operations/listAllUserAuditLogs.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-listAllUserAuditLogs",
} as any;

describe("listAllUserAuditLogs", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        listAllUserAuditLogs(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
