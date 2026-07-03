import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { archiveAnEmailAddressListItem } from "../src/operations/archiveAnEmailAddressListItem.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  listItemId: "listitemid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-archiveAnEmailAddressListItem",
} as any;

describe("archiveAnEmailAddressListItem", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        archiveAnEmailAddressListItem(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
