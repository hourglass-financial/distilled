import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface AuthorizationRoleAssignmentsControllerListRoleAssignmentsInput {
  organization_membership_id: string;
  before?: string;
  after?: string;
  limit?: number;
  order?: "normal" | "desc" | "asc";
  resource_id?: string;
  resource_external_id?: string;
  resource_type_slug?: string;
}
export const AuthorizationRoleAssignmentsControllerListRoleAssignmentsInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    organization_membership_id: Schema.String.pipe(T.PathParam()),
    before: Schema.optional(Schema.String).pipe(T.HttpQuery("before")),
    after: Schema.optional(Schema.String).pipe(T.HttpQuery("after")),
    limit: Schema.optional(Schema.Number).pipe(T.HttpQuery("limit")),
    order: Schema.optional(Schema.Literals(["normal", "desc", "asc"])).pipe(
      T.HttpQuery("order"),
    ),
    resource_id: Schema.optional(Schema.String).pipe(
      T.HttpQuery("resource_id"),
    ),
    resource_external_id: Schema.optional(Schema.String).pipe(
      T.HttpQuery("resource_external_id"),
    ),
    resource_type_slug: Schema.optional(Schema.String).pipe(
      T.HttpQuery("resource_type_slug"),
    ),
  }).pipe(
    T.Http({
      method: "GET",
      path: "/authorization/organization_memberships/{organization_membership_id}/role_assignments",
    }),
  ) as unknown as GeneratedStructCodec<AuthorizationRoleAssignmentsControllerListRoleAssignmentsInput>;

// Output Schema
export interface AuthorizationRoleAssignmentsControllerListRoleAssignmentsOutput {
  object: "list";
  data: ReadonlyArray<{
    object: "role_assignment";
    id: string;
    organization_membership_id: string;
    role: { slug: string };
    resource: { id: string; external_id: string; resource_type_slug: string };
    created_at: string;
    updated_at: string;
  }>;
  list_metadata: { before: string | null; after: string | null };
}
export const AuthorizationRoleAssignmentsControllerListRoleAssignmentsOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["list"]),
    data: Schema.Array(
      Schema.Struct({
        object: Schema.Literals(["role_assignment"]),
        id: Schema.String,
        organization_membership_id: Schema.String,
        role: Schema.Struct({
          slug: Schema.String,
        }),
        resource: Schema.Struct({
          id: Schema.String,
          external_id: Schema.String,
          resource_type_slug: Schema.String,
        }),
        created_at: Schema.String,
        updated_at: Schema.String,
      }),
    ),
    list_metadata: Schema.Struct({
      before: Schema.NullOr(Schema.String),
      after: Schema.NullOr(Schema.String),
    }),
  }) as unknown as GeneratedStructCodec<AuthorizationRoleAssignmentsControllerListRoleAssignmentsOutput>;

// The operation
/**
 * List role assignments
 *
 * List all role assignments for an organization membership. This returns all roles that have been assigned to the user on resources, including organization-level and sub-resource roles.
 *
 * @param organization_membership_id - The ID of the organization membership.
 * @param before - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list. For example, if you make a list request and receive 100 objects, ending with `"obj_123"`, your subsequent call can include `before="obj_123"` to fetch a new batch of objects before `"obj_123"`.
 * @param after - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list. For example, if you make a list request and receive 100 objects, ending with `"obj_123"`, your subsequent call can include `after="obj_123"` to fetch a new batch of objects after `"obj_123"`.
 * @param limit - Upper limit on the number of objects to return, between `1` and `100`.
 * @param order - Order the results by the creation time. Supported values are `"asc"` (ascending), `"desc"` (descending), and `"normal"` (descending with reversed cursor semantics where `before` fetches older records and `after` fetches newer records).
 * @param resource_id - Filter assignments by the ID of the resource.
 * @param resource_external_id - Filter assignments by the external ID of the resource.
 * @param resource_type_slug - Filter assignments by the slug of the resource type.
 */
export const AuthorizationRoleAssignmentsControllerListRoleAssignments =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: AuthorizationRoleAssignmentsControllerListRoleAssignmentsInput,
    outputSchema:
      AuthorizationRoleAssignmentsControllerListRoleAssignmentsOutput,
    errors: [Forbidden, NotFound] as const,
  }));
