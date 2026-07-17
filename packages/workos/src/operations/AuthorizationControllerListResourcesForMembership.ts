import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import {
  BadRequest,
  Forbidden,
  NotFound,
  UnprocessableEntity,
} from "../errors.ts";

// Input Schema
export interface AuthorizationControllerListResourcesForMembershipInput {
  organization_membership_id: string;
  before?: string;
  after?: string;
  limit?: number;
  order?: "normal" | "desc" | "asc";
  permission_slug: string;
  parent_resource_id?: string;
  parent_resource_type_slug?: string;
  parent_resource_external_id?: string;
}
export const AuthorizationControllerListResourcesForMembershipInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    organization_membership_id: Schema.String.pipe(T.PathParam()),
    before: Schema.optional(Schema.String).pipe(T.HttpQuery("before")),
    after: Schema.optional(Schema.String).pipe(T.HttpQuery("after")),
    limit: Schema.optional(Schema.Number).pipe(T.HttpQuery("limit")),
    order: Schema.optional(Schema.Literals(["normal", "desc", "asc"])).pipe(
      T.HttpQuery("order"),
    ),
    permission_slug: Schema.String.pipe(T.HttpQuery("permission_slug")),
    parent_resource_id: Schema.optional(Schema.String).pipe(
      T.HttpQuery("parent_resource_id"),
    ),
    parent_resource_type_slug: Schema.optional(Schema.String).pipe(
      T.HttpQuery("parent_resource_type_slug"),
    ),
    parent_resource_external_id: Schema.optional(Schema.String).pipe(
      T.HttpQuery("parent_resource_external_id"),
    ),
  }).pipe(
    T.Http({
      method: "GET",
      path: "/authorization/organization_memberships/{organization_membership_id}/resources",
    }),
  ) as unknown as GeneratedStructCodec<AuthorizationControllerListResourcesForMembershipInput>;

// Output Schema
export interface AuthorizationControllerListResourcesForMembershipOutput {
  object: "list";
  data: ReadonlyArray<{
    object: "authorization_resource";
    name: string;
    description: string | null;
    organization_id: string;
    parent_resource_id: string | null;
    id: string;
    external_id: string;
    resource_type_slug: string;
    created_at: string;
    updated_at: string;
  }>;
  list_metadata: { before: string | null; after: string | null };
}
export const AuthorizationControllerListResourcesForMembershipOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["list"]),
    data: Schema.Array(
      Schema.Struct({
        object: Schema.Literals(["authorization_resource"]),
        name: Schema.String,
        description: Schema.NullOr(Schema.String),
        organization_id: Schema.String,
        parent_resource_id: Schema.NullOr(Schema.String),
        id: Schema.String,
        external_id: Schema.String,
        resource_type_slug: Schema.String,
        created_at: Schema.String,
        updated_at: Schema.String,
      }),
    ),
    list_metadata: Schema.Struct({
      before: Schema.NullOr(Schema.String),
      after: Schema.NullOr(Schema.String),
    }),
  }) as unknown as GeneratedStructCodec<AuthorizationControllerListResourcesForMembershipOutput>;

// The operation
/**
 * List resources for organization membership
 *
 * Returns all child resources of a parent resource where the organization membership has a specific permission. This is useful for resource discovery—answering "What projects can this user access in this workspace?"
 * You must provide either `parent_resource_id` or both `parent_resource_external_id` and `parent_resource_type_slug` to identify the parent resource.
 *
 * @param organization_membership_id - The ID of the organization membership.
 * @param before - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list. For example, if you make a list request and receive 100 objects, ending with `"obj_123"`, your subsequent call can include `before="obj_123"` to fetch a new batch of objects before `"obj_123"`.
 * @param after - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list. For example, if you make a list request and receive 100 objects, ending with `"obj_123"`, your subsequent call can include `after="obj_123"` to fetch a new batch of objects after `"obj_123"`.
 * @param limit - Upper limit on the number of objects to return, between `1` and `100`.
 * @param order - Order the results by the creation time. Supported values are `"asc"` (ascending), `"desc"` (descending), and `"normal"` (descending with reversed cursor semantics where `before` fetches older records and `after` fetches newer records).
 * @param permission_slug - The permission slug to filter by. Only child resources where the organization membership has this permission are returned.
 * @param parent_resource_id - The WorkOS ID of the parent resource. Provide this or both `parent_resource_external_id` and `parent_resource_type_slug`, but not both. Mutually exclusive with `parent_resource_type_slug` and `parent_resource_external_id`.
 * @param parent_resource_type_slug - The slug of the parent resource type. Must be provided together with `parent_resource_external_id`. Required with `parent_resource_external_id`. Mutually exclusive with `parent_resource_id`.
 * @param parent_resource_external_id - The application-specific external identifier of the parent resource. Must be provided together with `parent_resource_type_slug`. Required with `parent_resource_type_slug`. Mutually exclusive with `parent_resource_id`.
 */
export const AuthorizationControllerListResourcesForMembership =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: AuthorizationControllerListResourcesForMembershipInput,
    outputSchema: AuthorizationControllerListResourcesForMembershipOutput,
    errors: [BadRequest, Forbidden, NotFound, UnprocessableEntity] as const,
  }));
