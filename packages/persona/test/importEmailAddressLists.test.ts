import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { importEmailAddressLists } from "../src/operations/importEmailAddressLists.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  data: {
    attributes: {
      file: {},
      "list-id": "list_id_distilled_missing",
    },
  },
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-importEmailAddressLists",
} as any;

describe("importEmailAddressLists", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        importEmailAddressLists(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
