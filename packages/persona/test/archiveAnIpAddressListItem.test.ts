import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { archiveAnIpAddressListItem } from "../src/operations/archiveAnIpAddressListItem.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  listItemId: "listitemid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-archiveAnIpAddressListItem",
} as any;

describe("archiveAnIpAddressListItem", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        archiveAnIpAddressListItem(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
