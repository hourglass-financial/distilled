import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { retrieveAnImporter } from "../src/operations/retrieveAnImporter.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  importerId: "importerid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-retrieveAnImporter",
} as any;

describe("retrieveAnImporter", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        retrieveAnImporter(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
