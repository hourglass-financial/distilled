import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { retrieveADocument } from "../src/operations/retrieveADocument.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  documentId: "documentid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-retrieveADocument",
} as any;

describe("retrieveADocument", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        retrieveADocument(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
