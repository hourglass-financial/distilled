import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { Forbidden, NotFound, UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface AuthorizationRoleAssignmentsControllerRemoveRoleByCriteriaInput {
  organization_membership_id: string;
  role_slug: string;
  resource_id?: string;
  resource_external_id?: string;
  resource_type_slug?: string;
}
export const AuthorizationRoleAssignmentsControllerRemoveRoleByCriteriaInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    organization_membership_id: Schema.String.pipe(T.PathParam()),
    role_slug: Schema.String,
    resource_id: Schema.optional(Schema.String),
    resource_external_id: Schema.optional(Schema.String),
    resource_type_slug: Schema.optional(Schema.String),
  }).pipe(
    T.Http({
      method: "DELETE",
      path: "/authorization/organization_memberships/{organization_membership_id}/role_assignments",
    }),
  ) as unknown as Schema.Codec<AuthorizationRoleAssignmentsControllerRemoveRoleByCriteriaInput>;

// Output Schema
export type AuthorizationRoleAssignmentsControllerRemoveRoleByCriteriaOutput =
  void;
export const AuthorizationRoleAssignmentsControllerRemoveRoleByCriteriaOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Void as unknown as Schema.Codec<AuthorizationRoleAssignmentsControllerRemoveRoleByCriteriaOutput>;

// The operation
/**
 * Remove a role assignment
 *
 * Remove a role assignment by role slug and resource.
 *
 * @param organization_membership_id - The ID of the organization membership.
 */
export const AuthorizationRoleAssignmentsControllerRemoveRoleByCriteria =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema:
      AuthorizationRoleAssignmentsControllerRemoveRoleByCriteriaInput,
    outputSchema:
      AuthorizationRoleAssignmentsControllerRemoveRoleByCriteriaOutput,
    errors: [Forbidden, NotFound, UnprocessableEntity] as const,
  }));
