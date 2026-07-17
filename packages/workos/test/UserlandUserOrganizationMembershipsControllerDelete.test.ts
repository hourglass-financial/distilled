import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { UserlandUserOrganizationMembershipsControllerDelete } from "../src/operations/UserlandUserOrganizationMembershipsControllerDelete.ts";
import { UserlandUserOrganizationMembershipsControllerGet } from "../src/operations/UserlandUserOrganizationMembershipsControllerGet.ts";
import { withOrganizationMembership } from "./resources.ts";
import { runEffect, testRunId } from "./setup.ts";

describe("UserlandUserOrganizationMembershipsControllerDelete", () => {
  it("permanently deletes an organization membership", async () => {
    const deletedId = await runEffect(
      withOrganizationMembership("membership-delete", (membership) =>
        UserlandUserOrganizationMembershipsControllerDelete({
          id: membership.id,
        }).pipe(Effect.as(membership.id)),
      ),
    );

    const error = await runEffect(
      UserlandUserOrganizationMembershipsControllerGet({
        id: deletedId,
      }).pipe(Effect.flip),
    );
    expect(error._tag).toBe("NotFound");
  }, 90_000);

  it("fails with NotFound for a non-existent membership id", async () => {
    const error = await runEffect(
      UserlandUserOrganizationMembershipsControllerDelete({
        id: `om_does_not_exist_${testRunId}`,
      }).pipe(Effect.flip),
    );
    expect(error._tag).toBe("NotFound");
  }, 30_000);
});
