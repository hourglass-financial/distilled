import { beforeAll, describe, expect, it } from "vitest";
import { inquiriesAddTag } from "../../src/operations/inquiriesAddTag.ts";
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
describe("inquiriesAddTag", () => {
  beforeAll(beginLiveTestRun);

  it("adds a tag to an owned inquiry", async () => {
    await withOwnedInquiry("add-tag", async ({ id }) => {
      const tag = ownedName("tag", "inquiry-add");
      await runLiveEffect(
        inquiriesAddTag({
          inquiryId: id,
          idempotencyKey: idempotencyKey("inquiry-add-tag", "add"),
          personaVersion: PERSONA_VERSION,
          meta: { "tag-name": tag },
        }),
      );
      const retrieved = await runLiveEffect(
        retrieveAnInquiry({ inquiryId: id, personaVersion: PERSONA_VERSION }),
      );
      expect(retrieved.data.attributes.tags.map(String)).toContain(
        tag.toUpperCase(),
      );
    });
  }, 60_000);

  it("returns NotFound for a valid-format missing inquiry", async () => {
    const failure = await runFailure(
      inquiriesAddTag({
        inquiryId: missingId("inq"),
        idempotencyKey: idempotencyKey("inquiry-add-tag", "missing"),
        personaVersion: PERSONA_VERSION,
        meta: { "tag-name": ownedName("tag", "missing-inquiry") },
      }),
    );
    expect(failure.tag).toBe("NotFound");
  }, 30_000);
});
