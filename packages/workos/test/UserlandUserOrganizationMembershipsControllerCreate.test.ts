import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { UserlandUserOrganizationMembershipsControllerCreate } from "../src/operations/UserlandUserOrganizationMembershipsControllerCreate.ts";
import { withOrganizationMembership } from "./resources.ts";
import { runEffect, testRunId } from "./setup.ts";

const typedErrorTags = [
  "BadRequest",
  "NotFound",
  "UnprocessableEntity",
] as const;

describe("UserlandUserOrganizationMembershipsControllerCreate", () => {
  it("creates an organization membership", async () => {
    const result = await runEffect(
      withOrganizationMembership("membership-create", (membership) =>
        Effect.succeed(membership),
      ),
    );

    expect(typeof result.id).toBe("string");
    expect(typeof result.user_id).toBe("string");
    expect(typeof result.organization_id).toBe("string");
    expect(["active", "inactive", "pending"]).toContain(result.status);
    expect(typeof result.role.slug).toBe("string");
    expect(result.roles.length).toBeGreaterThan(0);
  }, 30_000);

  it("fails with a typed BadRequest when required body fields are empty", async () => {
    const error = await runEffect(
      UserlandUserOrganizationMembershipsControllerCreate({
        user_id: "",
        organization_id: "",
      }).pipe(Effect.flip),
    );
    expect(typedErrorTags).toContain(error._tag);
  }, 30_000);

  it("fails with a typed NotFound when the referenced user or organization cannot be resolved", async () => {
    const error = await runEffect(
      UserlandUserOrganizationMembershipsControllerCreate({
        user_id: `user_does_not_exist_${testRunId}`,
        organization_id: `org_does_not_exist_${testRunId}`,
      }).pipe(Effect.flip),
    );
    expect(typedErrorTags).toContain(error._tag);
  }, 30_000);
});
