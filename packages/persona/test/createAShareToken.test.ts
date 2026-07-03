import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createAShareToken } from "../src/operations/createAShareToken.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  data: {
    attributes: {
      "connection-id": "connection_id_distilled_missing",
      "source-id": "source_id_distilled_missing",
    },
  },
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createAShareToken",
} as any;

describe("createAShareToken", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createAShareToken(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
