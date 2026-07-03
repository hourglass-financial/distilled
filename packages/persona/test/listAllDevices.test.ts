import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { listAllDevices } from "../src/operations/listAllDevices.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  filter: {
    "inquiry-session-id": "inquiry_session_id_distilled_missing",
  },
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-listAllDevices",
} as any;

describe("listAllDevices", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        listAllDevices(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
