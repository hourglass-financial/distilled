import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { listAllApiLogs } from "../src/operations/listAllApiLogs.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-listAllApiLogs",
} as any;

describe("listAllApiLogs", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        listAllApiLogs(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
