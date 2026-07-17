import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound, UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface UserlandUserOrganizationMembershipsControllerListInput {
  before?: string;
  after?: string;
  limit?: number;
  order?: "normal" | "desc" | "asc";
  organization_id?: string;
  statuses?: ReadonlyArray<"active" | "inactive" | "pending">;
  user_id?: string;
}
export const UserlandUserOrganizationMembershipsControllerListInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    before: Schema.optional(Schema.String).pipe(T.HttpQuery("before")),
    after: Schema.optional(Schema.String).pipe(T.HttpQuery("after")),
    limit: Schema.optional(Schema.Number).pipe(T.HttpQuery("limit")),
    order: Schema.optional(Schema.Literals(["normal", "desc", "asc"])).pipe(
      T.HttpQuery("order"),
    ),
    organization_id: Schema.optional(Schema.String).pipe(
      T.HttpQuery("organization_id"),
    ),
    statuses: Schema.optional(
      Schema.Array(Schema.Literals(["active", "inactive", "pending"])),
    ).pipe(T.HttpQuery("statuses", { style: "form", explode: false })),
    user_id: Schema.optional(Schema.String).pipe(T.HttpQuery("user_id")),
  }).pipe(
    T.Http({
      method: "GET",
      path: "/user_management/organization_memberships",
    }),
  ) as unknown as GeneratedStructCodec<UserlandUserOrganizationMembershipsControllerListInput>;

// Output Schema
export interface UserlandUserOrganizationMembershipsControllerListOutput {
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
    role: { slug: string };
    roles: ReadonlyArray<{ slug: string }>;
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
export const UserlandUserOrganizationMembershipsControllerListOutput =
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
        role: Schema.Struct({
          slug: Schema.String,
        }),
        roles: Schema.Array(
          Schema.Struct({
            slug: Schema.String,
          }),
        ),
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
  }) as unknown as GeneratedStructCodec<UserlandUserOrganizationMembershipsControllerListOutput>;

// The operation
/**
 * List organization memberships
 *
 * Get a list of all organization memberships matching the criteria specified. At least one of `user_id` or `organization_id` must be provided. By default only active memberships are returned. Use the `statuses` parameter to filter by other statuses.
 *
 * @param before - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list. For example, if you make a list request and receive 100 objects, ending with `"obj_123"`, your subsequent call can include `before="obj_123"` to fetch a new batch of objects before `"obj_123"`.
 * @param after - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list. For example, if you make a list request and receive 100 objects, ending with `"obj_123"`, your subsequent call can include `after="obj_123"` to fetch a new batch of objects after `"obj_123"`.
 * @param limit - Upper limit on the number of objects to return, between `1` and `100`.
 * @param order - Order the results by the creation time. Supported values are `"asc"` (ascending), `"desc"` (descending), and `"normal"` (descending with reversed cursor semantics where `before` fetches older records and `after` fetches newer records).
 * @param organization_id - The ID of the [organization](/reference/organization) which the user belongs to.
 * @param statuses - Filter by the status of the organization membership. Array including any of `active`, `inactive`, or `pending`.
 * @param user_id - The ID of the [user](/reference/authkit/user).
 */
export const UserlandUserOrganizationMembershipsControllerList =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: UserlandUserOrganizationMembershipsControllerListInput,
    outputSchema: UserlandUserOrganizationMembershipsControllerListOutput,
    errors: [BadRequest, NotFound, UnprocessableEntity] as const,
  }));
