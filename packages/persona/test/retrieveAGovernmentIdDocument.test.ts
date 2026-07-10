import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { retrieveAGovernmentIdDocument } from "../src/operations/retrieveAGovernmentIdDocument.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  documentId: "documentid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-retrieveAGovernmentIdDocument",
} as any;

describe("retrieveAGovernmentIdDocument", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        retrieveAGovernmentIdDocument(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
