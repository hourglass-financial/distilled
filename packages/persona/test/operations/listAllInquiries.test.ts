import { beforeAll, describe, expect, it } from "vitest";
import { listAllInquiries } from "../../src/operations/listAllInquiries.ts";
import { PERSONA_VERSION } from "../fixtures.ts";
import { withOwnedInquiry } from "../inquiry-fixture.ts";
import { runLiveEffect } from "../safe-run.ts";
import { beginLiveTestRun } from "../setup.ts";

// Coverage: live-data
describe("listAllInquiries", () => {
  beforeAll(beginLiveTestRun);

  it("filters the authenticated collection to an owned inquiry", async () => {
    await withOwnedInquiry("list", async ({ id }) => {
      const result = await runLiveEffect(
        listAllInquiries({
          filter: { "inquiry-id": id },
          page: { size: 10 },
          personaVersion: PERSONA_VERSION,
        }),
      );
      expect(result.data.map((inquiry) => inquiry.id)).toContain(id);
    });
  }, 60_000);
});
