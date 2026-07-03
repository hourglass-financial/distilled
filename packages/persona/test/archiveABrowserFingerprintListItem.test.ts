import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { archiveABrowserFingerprintListItem } from "../src/operations/archiveABrowserFingerprintListItem.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  listItemId: "listitemid_distilled_missing",
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-archiveABrowserFingerprintListItem",
} as any;

describe("archiveABrowserFingerprintListItem", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        archiveABrowserFingerprintListItem(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
