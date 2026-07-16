import { beforeAll, describe, expect, it } from "vitest";
import { inquiriesAddTag } from "../../src/operations/inquiriesAddTag.ts";
import { inquiriesSetAllTags } from "../../src/operations/inquiriesSetAllTags.ts";
import { retrieveAnInquiry } from "../../src/operations/retrieveAnInquiry.ts";
import {
  idempotencyKey,
  ownedName,
  PERSONA_VERSION,
  missingId,
} from "../fixtures.ts";
import { withOwnedInquiry } from "../inquiry-fixture.ts";
import { runFailure, runLiveEffect } from "../safe-run.ts";
import { beginLiveTestRun } from "../setup.ts";

// Coverage: live-lifecycle
describe("inquiriesSetAllTags", () => {
  beforeAll(beginLiveTestRun);

  it("replaces all tags on an owned inquiry", async () => {
    await withOwnedInquiry("set-tags", async ({ id }) => {
      const tag = ownedName("tag", "inquiry-set");
      await runLiveEffect(
        inquiriesAddTag({
          inquiryId: id,
          idempotencyKey: idempotencyKey("inquiry-add-tag", "set"),
          personaVersion: PERSONA_VERSION,
          meta: { "tag-name": tag },
        }),
      );
      await runLiveEffect(
        inquiriesSetAllTags({
          inquiryId: id,
          idempotencyKey: idempotencyKey("inquiry-set-tags", "set"),
          personaVersion: PERSONA_VERSION,
          meta: { "tag-name": [tag] },
        }),
      );
      const retrieved = await runLiveEffect(
        retrieveAnInquiry({ inquiryId: id, personaVersion: PERSONA_VERSION }),
      );
      expect(retrieved.data.attributes.tags.map(String)).toEqual([
        tag.toUpperCase(),
      ]);
    });
  }, 60_000);

  it("returns NotFound for a valid-format missing inquiry", async () => {
    const failure = await runFailure(
      inquiriesSetAllTags({
        inquiryId: missingId("inq"),
        idempotencyKey: idempotencyKey("inquiry-set-tags", "missing"),
        personaVersion: PERSONA_VERSION,
        meta: { "tag-name": [ownedName("tag", "missing-inquiry")] },
      }),
    );
    expect(failure.tag).toBe("NotFound");
  }, 30_000);
});
