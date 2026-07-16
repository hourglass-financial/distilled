import { beforeAll, describe, expect, it } from "vitest";
import { inquiriesAddTag } from "../src/operations/inquiriesAddTag.ts";
import { inquiriesRemoveTag } from "../src/operations/inquiriesRemoveTag.ts";
import { retrieveAnInquiry } from "../src/operations/retrieveAnInquiry.ts";
import { idempotencyKey, ownedName, PERSONA_VERSION } from "./fixtures.ts";
import { withOwnedInquiry } from "./inquiry-fixture.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun } from "./setup.ts";

// Coverage: live-lifecycle
describe("inquiriesRemoveTag", () => {
  beforeAll(beginLiveTestRun);

  it("removes a tag from an owned inquiry", async () => {
    await withOwnedInquiry("remove-tag", async ({ id }) => {
      const tag = ownedName("tag", "inquiry-remove");
      await runLiveEffect(
        inquiriesAddTag({
          inquiryId: id,
          idempotencyKey: idempotencyKey("inquiry-add-tag", "remove"),
          personaVersion: PERSONA_VERSION,
          meta: { "tag-name": tag },
        }),
      );
      await runLiveEffect(
        inquiriesRemoveTag({
          inquiryId: id,
          idempotencyKey: idempotencyKey("inquiry-remove-tag", "remove"),
          personaVersion: PERSONA_VERSION,
          meta: { "tag-name": tag },
        }),
      );
      const retrieved = await runLiveEffect(
        retrieveAnInquiry({ inquiryId: id, personaVersion: PERSONA_VERSION }),
      );
      expect(retrieved.data.attributes.tags.map(String)).not.toContain(
        tag.toUpperCase(),
      );
    });
  }, 60_000);
});
