import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { importIpAddressLists } from "../src/operations/importIpAddressLists.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  data: {
    attributes: {
      file: {},
      "list-id": "list_id_distilled_missing",
    },
  },
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-importIpAddressLists",
} as any;

describe("importIpAddressLists", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        importIpAddressLists(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
