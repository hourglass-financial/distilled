import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createAuthorization } from "../src/operations/createAuthorization.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  "client-id": "client_id_distilled_missing",
  "response-type": "distilled-persona-response-type",
  scope: "distilled-persona-scope",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createAuthorization",
} as any;

describe("createAuthorization", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createAuthorization(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
