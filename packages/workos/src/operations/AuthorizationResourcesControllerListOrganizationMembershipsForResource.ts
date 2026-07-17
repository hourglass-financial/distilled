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
export interface AuthorizationResourcesControllerListOrganizationMembershipsForResourceInput {
  resource_id: string;
  before?: string;
  after?: string;
  limit?: number;
  order?: "normal" | "desc" | "asc";
  permission_slug: string;
  assignment?: "direct" | "indirect";
}
export const AuthorizationResourcesControllerListOrganizationMembershipsForResourceInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    resource_id: Schema.String.pipe(T.PathParam()),
    before: Schema.optional(Schema.String).pipe(T.HttpQuery("before")),
    after: Schema.optional(Schema.String).pipe(T.HttpQuery("after")),
    limit: Schema.optional(Schema.Number).pipe(T.HttpQuery("limit")),
    order: Schema.optional(Schema.Literals(["normal", "desc", "asc"])).pipe(
      T.HttpQuery("order"),
    ),
    permission_slug: Schema.String.pipe(T.HttpQuery("permission_slug")),
    assignment: Schema.optional(Schema.Literals(["direct", "indirect"])).pipe(
      T.HttpQuery("assignment"),
    ),
  }).pipe(
    T.Http({
      method: "GET",
      path: "/authorization/resources/{resource_id}/organization_memberships",
    }),
  ) as unknown as GeneratedStructCodec<AuthorizationResourcesControllerListOrganizationMembershipsForResourceInput>;

// Output Schema
export interface AuthorizationResourcesControllerListOrganizationMembershipsForResourceOutput {
  object: "list";
  data: ReadonlyArray<{
    object: "organization_membership";
    id: string;
    user_id: string;
    organization_id: string;
    status: "active" | "inactive" | "pending";
    directory_managed: boolean;
    organization_name?: string;
    custom_attributes?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    user: {
      object: "user";
      id: string;
      first_name: string | null;
      last_name: string | null;
      name?: string | null;
      profile_picture_url: string | null;
      email: string;
      email_verified: boolean;
      external_id: string | null;
      metadata?: Record<string, string>;
      last_sign_in_at: string | null;
      locale?: string | null;
      created_at: string;
      updated_at: string;
    };
  }>;
  list_metadata: { before: string | null; after: string | null };
}
export const AuthorizationResourcesControllerListOrganizationMembershipsForResourceOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["list"]),
    data: Schema.Array(
      Schema.Struct({
        object: Schema.Literals(["organization_membership"]),
        id: Schema.String,
        user_id: Schema.String,
        organization_id: Schema.String,
        status: Schema.Literals(["active", "inactive", "pending"]),
        directory_managed: Schema.Boolean,
        organization_name: Schema.optional(Schema.String),
        custom_attributes: Schema.optional(
          Schema.Record(Schema.String, Schema.Unknown),
        ),
        created_at: Schema.String,
        updated_at: Schema.String,
        user: Schema.Struct({
          object: Schema.Literals(["user"]),
          id: Schema.String,
          first_name: Schema.NullOr(Schema.String),
          last_name: Schema.NullOr(Schema.String),
          name: Schema.optional(Schema.NullOr(Schema.String)),
          profile_picture_url: Schema.NullOr(Schema.String),
          email: Schema.String,
          email_verified: Schema.Boolean,
          external_id: Schema.NullOr(Schema.String),
          metadata: Schema.optional(
            Schema.Record(Schema.String, Schema.String),
          ),
          last_sign_in_at: Schema.NullOr(Schema.String),
          locale: Schema.optional(Schema.NullOr(Schema.String)),
          created_at: Schema.String,
          updated_at: Schema.String,
        }),
      }),
    ),
    list_metadata: Schema.Struct({
      before: Schema.NullOr(Schema.String),
      after: Schema.NullOr(Schema.String),
    }),
  }) as unknown as GeneratedStructCodec<AuthorizationResourcesControllerListOrganizationMembershipsForResourceOutput>;

// The operation
/**
 * List organization memberships for resource
 *
 * Returns all organization memberships that have a specific permission on a resource instance. This is useful for answering "Who can access this resource?".
 *
 * @param resource_id - The ID of the authorization resource.
 * @param before - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list. For example, if you make a list request and receive 100 objects, ending with `"obj_123"`, your subsequent call can include `before="obj_123"` to fetch a new batch of objects before `"obj_123"`.
 * @param after - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list. For example, if you make a list request and receive 100 objects, ending with `"obj_123"`, your subsequent call can include `after="obj_123"` to fetch a new batch of objects after `"obj_123"`.
 * @param limit - Upper limit on the number of objects to return, between `1` and `100`.
 * @param order - Order the results by the creation time. Supported values are `"asc"` (ascending), `"desc"` (descending), and `"normal"` (descending with reversed cursor semantics where `before` fetches older records and `after` fetches newer records).
 * @param permission_slug - The permission slug to filter by. Only users with this permission on the resource are returned.
 * @param assignment - Filter by assignment type. Use `direct` for direct assignments only, or `indirect` to include inherited assignments.
 */
export const AuthorizationResourcesControllerListOrganizationMembershipsForResource =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema:
      AuthorizationResourcesControllerListOrganizationMembershipsForResourceInput,
    outputSchema:
      AuthorizationResourcesControllerListOrganizationMembershipsForResourceOutput,
    errors: [BadRequest, Forbidden, NotFound, UnprocessableEntity] as const,
  }));
