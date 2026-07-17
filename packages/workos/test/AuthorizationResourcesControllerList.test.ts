import { describe, expect, it } from "vitest";
import { AuthorizationResourcesControllerList } from "../src/operations/AuthorizationResourcesControllerList.ts";
import { OrganizationsControllerList } from "../src/operations/OrganizationsControllerList.ts";
import { runOrSkipOnEnvLimitation } from "./setup.ts";

describe("AuthorizationResourcesControllerList", () => {
  it("lists authorization resources", async (ctx) => {
    const organizations = await runOrSkipOnEnvLimitation(
      ctx,
      OrganizationsControllerList({ limit: 1 }),
    );
    const organization = organizations.data[0];
    if (!organization) {
      ctx.skip("workspace has no organization for resource listing");
      return;
    }

    const result = await runOrSkipOnEnvLimitation(
      ctx,
      AuthorizationResourcesControllerList({
        limit: 10,
        organization_id: organization.id,
      }),
    );

    expect(result).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.list_metadata).toBeDefined();
  }, 30_000);
});
