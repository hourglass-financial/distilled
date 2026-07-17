import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { UserlandUserOrganizationMembershipsControllerGet } from "../src/operations/UserlandUserOrganizationMembershipsControllerGet.ts";
import { withOrganizationMembership } from "./resources.ts";
import { runEffect, testRunId } from "./setup.ts";

describe("UserlandUserOrganizationMembershipsControllerGet", () => {
  it("fetches an organization membership by id", async () => {
    const result = await runEffect(
      withOrganizationMembership("membership-get", (membership) =>
        UserlandUserOrganizationMembershipsControllerGet({
          id: membership.id,
        }),
      ),
    );
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(typeof result.user_id).toBe("string");
    expect(typeof result.organization_id).toBe("string");
    expect(["active", "inactive", "pending"]).toContain(result.status);
    expect(typeof result.role.slug).toBe("string");
    expect(result.roles.length).toBeGreaterThan(0);
    expect(result.roles.every((role) => typeof role.slug === "string")).toBe(
      true,
    );
    expect(typeof result.directory_managed).toBe("boolean");
  }, 60_000);

  it("fails with NotFound for a non-existent membership id", async () => {
    const error = await runEffect(
      UserlandUserOrganizationMembershipsControllerGet({
        id: `om_does_not_exist_${testRunId}`,
      }).pipe(Effect.flip),
    );
    expect(error._tag).toBe("NotFound");
  }, 30_000);
});
