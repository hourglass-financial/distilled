import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";
import { UserlandUserOrganizationMembershipsControllerGetOutput } from "../src/operations/UserlandUserOrganizationMembershipsControllerGet.ts";
import { UserlandUserOrganizationMembershipsControllerUpdateOutput } from "../src/operations/UserlandUserOrganizationMembershipsControllerUpdate.ts";

const membership = {
  object: "organization_membership" as const,
  id: "om_01",
  user_id: "user_01",
  organization_id: "org_01",
  status: "active" as const,
  directory_managed: false,
  created_at: "2026-07-16T00:00:00.000Z",
  updated_at: "2026-07-16T00:00:00.000Z",
  role: { slug: "member" },
  roles: [{ slug: "member" }],
  user: {
    object: "user" as const,
    id: "user_01",
    first_name: null,
    last_name: null,
    profile_picture_url: null,
    email: "person@example.test",
    email_verified: true,
    external_id: null,
    last_sign_in_at: null,
    created_at: "2026-07-16T00:00:00.000Z",
    updated_at: "2026-07-16T00:00:00.000Z",
  },
};

describe("organization membership response contract", () => {
  it.each([
    ["get", UserlandUserOrganizationMembershipsControllerGetOutput],
    ["update", UserlandUserOrganizationMembershipsControllerUpdateOutput],
  ])("requires the complete membership fields for %s", (_name, schema) => {
    expect(Schema.decodeUnknownSync(schema)(membership)).toEqual(membership);

    const { roles: _roles, ...withoutRoles } = membership;
    expect(() => Schema.decodeUnknownSync(schema)(withoutRoles)).toThrow(
      /roles/,
    );
  });
});
