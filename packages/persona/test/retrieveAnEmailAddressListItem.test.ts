import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { retrieveAnEmailAddressListItem } from "../src/operations/retrieveAnEmailAddressListItem.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  listItemId: "listitemid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-retrieveAnEmailAddressListItem",
} as any;

describe("retrieveAnEmailAddressListItem", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        retrieveAnEmailAddressListItem(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
