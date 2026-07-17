import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface AuthorizationOrganizationRolePermissionsControllerRemovePermissionInput {
  organizationId: string;
  slug: string;
  permissionSlug: string;
}
export const AuthorizationOrganizationRolePermissionsControllerRemovePermissionInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    organizationId: Schema.String.pipe(T.PathParam()),
    slug: Schema.String.pipe(T.PathParam()),
    permissionSlug: Schema.String.pipe(T.PathParam()),
  }).pipe(
    T.Http({
      method: "DELETE",
      path: "/authorization/organizations/{organizationId}/roles/{slug}/permissions/{permissionSlug}",
    }),
  ) as unknown as GeneratedStructCodec<AuthorizationOrganizationRolePermissionsControllerRemovePermissionInput>;

// Output Schema
export interface AuthorizationOrganizationRolePermissionsControllerRemovePermissionOutput {
  slug: string;
  object: "role";
  id: string;
  name: string;
  description: string | null;
  type: "EnvironmentRole" | "OrganizationRole";
  resource_type_slug: string;
  permissions: ReadonlyArray<string>;
  created_at: string;
  updated_at: string;
}
export const AuthorizationOrganizationRolePermissionsControllerRemovePermissionOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    slug: Schema.String,
    object: Schema.Literals(["role"]),
    id: Schema.String,
    name: Schema.String,
    description: Schema.NullOr(Schema.String),
    type: Schema.Literals(["EnvironmentRole", "OrganizationRole"]),
    resource_type_slug: Schema.String,
    permissions: Schema.Array(Schema.String),
    created_at: Schema.String,
    updated_at: Schema.String,
  }) as unknown as GeneratedStructCodec<AuthorizationOrganizationRolePermissionsControllerRemovePermissionOutput>;

// The operation
/**
 * Remove a permission from a custom role
 *
 * Remove a single permission from a custom role by its slug.
 *
 * @param organizationId - The ID of the organization.
 * @param slug - The slug of the role.
 * @param permissionSlug - The slug of the permission to remove.
 */
export const AuthorizationOrganizationRolePermissionsControllerRemovePermission =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema:
      AuthorizationOrganizationRolePermissionsControllerRemovePermissionInput,
    outputSchema:
      AuthorizationOrganizationRolePermissionsControllerRemovePermissionOutput,
    errors: [Forbidden, NotFound] as const,
  }));
