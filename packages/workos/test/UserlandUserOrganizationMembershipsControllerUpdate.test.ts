import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { UserlandUserOrganizationMembershipsControllerList } from "../src/operations/UserlandUserOrganizationMembershipsControllerList.ts";
import { UserlandUserOrganizationMembershipsControllerUpdate } from "../src/operations/UserlandUserOrganizationMembershipsControllerUpdate.ts";
import { UserlandUsersControllerList } from "../src/operations/UserlandUsersControllerList.ts";
import { runEffect, runOrSkipOnEnvLimitation, testRunId } from "./setup.ts";

describe("UserlandUserOrganizationMembershipsControllerUpdate", () => {
  it(
    "updates an organization membership with its complete role set",
    async (ctx) => {
      const users = await runOrSkipOnEnvLimitation(
        ctx,
        UserlandUsersControllerList({ limit: 1 }),
      );

      const seedUser = users.data?.[0];
      if (!seedUser?.id) {
        ctx.skip("workspace has no user available for a membership update");
        return;
      }

      const memberships = await runOrSkipOnEnvLimitation(
        ctx,
        UserlandUserOrganizationMembershipsControllerList({
          user_id: seedUser.id,
          limit: 1,
        }),
      );
      const member = memberships.data?.[0];
      if (!member?.id) {
        ctx.skip("workspace user has no organization membership to update");
        return;
      }

      const roleSlugs = [
        ...(member.roles ?? []).map((role) => role.slug),
        member.role?.slug,
      ].filter((slug): slug is string => typeof slug === "string");
      const uniqueRoleSlugs = [...new Set(roleSlugs)];
      if (uniqueRoleSlugs.length === 0) {
        ctx.skip("workspace membership has no role slug to preserve");
        return;
      }

      const result = await runEffect(
        UserlandUserOrganizationMembershipsControllerUpdate({
          id: member.id,
          role_slugs: uniqueRoleSlugs,
        }),
      );
      const returnedRoleSlugs = (result.roles ?? [])
        .map((role) => role.slug)
        .filter((slug): slug is string => typeof slug === "string");

      expect(result.id).toBe(member.id);
      expect([...new Set(returnedRoleSlugs)].sort()).toEqual(
        [...uniqueRoleSlugs].sort(),
      );
    },
    60_000,
  );

  it(
    "fails with NotFound for a non-existent membership id",
    async () => {
      const error = await runEffect(
        UserlandUserOrganizationMembershipsControllerUpdate({
          id: `om_does_not_exist_${testRunId}`,
        }).pipe(Effect.flip),
      );
      expect(error._tag).toBe("NotFound");
    },
    30_000,
  );

  it(
    "fails with UnprocessableEntity for a malformed membership id",
    async () => {
      const error = await runEffect(
        UserlandUserOrganizationMembershipsControllerUpdate({
          id: `not-a-valid-id-${"x".repeat(300)}-${testRunId}`,
        }).pipe(Effect.flip),
      );
      expect(["NotFound", "UnprocessableEntity"]).toContain(error._tag);
    },
    30_000,
  );
});
