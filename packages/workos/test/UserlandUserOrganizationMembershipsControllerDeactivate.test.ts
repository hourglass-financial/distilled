import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { UserlandUserOrganizationMembershipsControllerDeactivate } from "../src/operations/UserlandUserOrganizationMembershipsControllerDeactivate.ts";
import { withOrganizationMembership } from "./resources.ts";
import { runEffect, testRunId } from "./setup.ts";

describe("UserlandUserOrganizationMembershipsControllerDeactivate", () => {
  it("deactivates an active organization membership", async () => {
    const result = await runEffect(
      withOrganizationMembership("membership-deactivate", (membership) =>
        UserlandUserOrganizationMembershipsControllerDeactivate({
          id: membership.id,
        }),
      ),
    );
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.status).toBe("inactive");
    expect(typeof result.user_id).toBe("string");
    expect(typeof result.organization_id).toBe("string");
    expect(typeof result.role.slug).toBe("string");
  }, 90_000);

  it("fails with BadRequest when the id is empty", async () => {
    const error = await runEffect(
      UserlandUserOrganizationMembershipsControllerDeactivate({
        id: "",
      }).pipe(Effect.flip),
    );
    expect(["BadRequest", "NotFound"]).toContain(error._tag);
  }, 30_000);

  it("fails with NotFound for a non-existent membership id", async () => {
    const error = await runEffect(
      UserlandUserOrganizationMembershipsControllerDeactivate({
        id: `om_does_not_exist_${testRunId}`,
      }).pipe(Effect.flip),
    );
    expect(error._tag).toBe("NotFound");
  }, 30_000);

  it("fails with UnprocessableEntity for a malformed membership id", async () => {
    const error = await runEffect(
      UserlandUserOrganizationMembershipsControllerDeactivate({
        id: `not-a-valid-id-${"x".repeat(300)}-${testRunId}`,
      }).pipe(Effect.flip),
    );
    expect(["NotFound", "UnprocessableEntity"]).toContain(error._tag);
  }, 30_000);
});
