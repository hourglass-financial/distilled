import * as Schema from "effect/Schema";

import { buildRequestParts, getHttpTrait } from "@distilled.cloud/core/traits";
import { CredentialsFromEnv } from "@hourglass-financial/workos/Credentials";
import { WorkosParseError } from "@hourglass-financial/workos/Errors";
import {
  UserlandUserOrganizationMembershipsControllerUpdate,
  UserlandUserOrganizationMembershipsControllerUpdateInput,
  UserlandUserOrganizationMembershipsControllerUpdateOutput,
} from "@hourglass-financial/workos/Operations";

const input = Schema.decodeUnknownSync(
  UserlandUserOrganizationMembershipsControllerUpdateInput,
)({
  id: "om_compatibility_fixture",
  role_slug: "member",
  role_slugs: ["member", "admin"],
});
const httpTrait = getHttpTrait(
  UserlandUserOrganizationMembershipsControllerUpdateInput.ast,
);
if (!httpTrait) {
  throw new Error("WorkOS membership update is missing its HTTP trait");
}
const request = buildRequestParts(
  UserlandUserOrganizationMembershipsControllerUpdateInput.ast,
  httpTrait,
  input,
  UserlandUserOrganizationMembershipsControllerUpdateInput,
);
const output = Schema.decodeUnknownSync(
  UserlandUserOrganizationMembershipsControllerUpdateOutput,
)({
  object: "organization_membership",
  id: "om_compatibility_fixture",
  user_id: "user_compatibility_fixture",
  organization_id: "org_compatibility_fixture",
  status: "active",
  directory_managed: false,
  created_at: "2026-07-17T00:00:00.000Z",
  updated_at: "2026-07-17T00:00:00.000Z",
  role: { slug: "member" },
  roles: [{ slug: "member" }, { slug: "admin" }],
  user: {
    object: "user",
    id: "user_compatibility_fixture",
    first_name: "Compatibility",
    last_name: "Fixture",
    profile_picture_url: null,
    email: "compatibility@example.com",
    email_verified: true,
    external_id: null,
    last_sign_in_at: null,
    created_at: "2026-07-17T00:00:00.000Z",
    updated_at: "2026-07-17T00:00:00.000Z",
  },
});
const operation = UserlandUserOrganizationMembershipsControllerUpdate(input);

if (
  !CredentialsFromEnv ||
  !WorkosParseError ||
  !UserlandUserOrganizationMembershipsControllerUpdateOutput ||
  input.role_slug !== "member" ||
  input.role_slugs?.[1] !== "admin" ||
  request.path !==
    "/user_management/organization_memberships/om_compatibility_fixture" ||
  request.body?.role_slug !== "member" ||
  !Array.isArray(request.body?.role_slugs) ||
  request.body.role_slugs[1] !== "admin" ||
  output.object !== "organization_membership" ||
  output.user_id !== "user_compatibility_fixture" ||
  output.roles[1]?.slug !== "admin" ||
  !operation
) {
  throw new Error("WorkOS compatibility contract is incomplete");
}
