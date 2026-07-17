import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { UserlandUserOrganizationMembershipsControllerUpdate } from "../src/operations/UserlandUserOrganizationMembershipsControllerUpdate.ts";
import { withOrganizationMembership } from "./resources.ts";
import { runEffect, testRunId } from "./setup.ts";

describe("UserlandUserOrganizationMembershipsControllerUpdate", () => {
  it("updates an organization membership with its complete role set", async () => {
    const result = await runEffect(
      withOrganizationMembership("membership-update", (membership) => {
        const roleSlugs = [
          ...membership.roles.map((role) => role.slug),
          membership.role.slug,
        ];
        const uniqueRoleSlugs = [...new Set(roleSlugs)];
        return UserlandUserOrganizationMembershipsControllerUpdate({
          id: membership.id,
          role_slugs: uniqueRoleSlugs,
        }).pipe(Effect.map((updated) => ({ updated, uniqueRoleSlugs })));
      }),
    );
    const returnedRoleSlugs = result.updated.roles
      .map((role) => role.slug)
      .filter((slug): slug is string => typeof slug === "string");

    expect(result.updated.id).toBeDefined();
    expect([...new Set(returnedRoleSlugs)].sort()).toEqual(
      [...result.uniqueRoleSlugs].sort(),
    );
  }, 60_000);

  it("fails with NotFound for a non-existent membership id", async () => {
    const error = await runEffect(
      UserlandUserOrganizationMembershipsControllerUpdate({
        id: `om_does_not_exist_${testRunId}`,
      }).pipe(Effect.flip),
    );
    expect(error._tag).toBe("NotFound");
  }, 30_000);

  it("fails with UnprocessableEntity for a malformed membership id", async () => {
    const error = await runEffect(
      UserlandUserOrganizationMembershipsControllerUpdate({
        id: `not-a-valid-id-${"x".repeat(300)}-${testRunId}`,
      }).pipe(Effect.flip),
    );
    expect(["NotFound", "UnprocessableEntity"]).toContain(error._tag);
  }, 30_000);
});
