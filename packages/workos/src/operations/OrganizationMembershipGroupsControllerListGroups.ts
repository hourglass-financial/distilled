import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { NotFound } from "../errors.ts";

// Input Schema
export interface OrganizationMembershipGroupsControllerListGroupsInput {
  omId: string;
  before?: string;
  after?: string;
  limit?: number;
  order?: "normal" | "desc" | "asc";
}
export const OrganizationMembershipGroupsControllerListGroupsInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    omId: Schema.String.pipe(T.PathParam()),
    before: Schema.optional(Schema.String).pipe(T.HttpQuery("before")),
    after: Schema.optional(Schema.String).pipe(T.HttpQuery("after")),
    limit: Schema.optional(Schema.Number).pipe(T.HttpQuery("limit")),
    order: Schema.optional(Schema.Literals(["normal", "desc", "asc"])).pipe(
      T.HttpQuery("order"),
    ),
  }).pipe(
    T.Http({
      method: "GET",
      path: "/user_management/organization_memberships/{omId}/groups",
    }),
  ) as unknown as GeneratedStructCodec<OrganizationMembershipGroupsControllerListGroupsInput>;

// Output Schema
export interface OrganizationMembershipGroupsControllerListGroupsOutput {
  object: "list";
  data: ReadonlyArray<{
    object: "group";
    id: string;
    organization_id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
  }>;
  list_metadata: { before: string | null; after: string | null };
}
export const OrganizationMembershipGroupsControllerListGroupsOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["list"]),
    data: Schema.Array(
      Schema.Struct({
        object: Schema.Literals(["group"]),
        id: Schema.String,
        organization_id: Schema.String,
        name: Schema.String,
        description: Schema.NullOr(Schema.String),
        created_at: Schema.String,
        updated_at: Schema.String,
      }),
    ),
    list_metadata: Schema.Struct({
      before: Schema.NullOr(Schema.String),
      after: Schema.NullOr(Schema.String),
    }),
  }) as unknown as GeneratedStructCodec<OrganizationMembershipGroupsControllerListGroupsOutput>;

// The operation
/**
 * List groups
 *
 * Get a list of groups that an organization membership belongs to.
 *
 * @param omId - Unique identifier of the Organization Membership.
 * @param before - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list. For example, if you make a list request and receive 100 objects, ending with `"obj_123"`, your subsequent call can include `before="obj_123"` to fetch a new batch of objects before `"obj_123"`.
 * @param after - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list. For example, if you make a list request and receive 100 objects, ending with `"obj_123"`, your subsequent call can include `after="obj_123"` to fetch a new batch of objects after `"obj_123"`.
 * @param limit - Upper limit on the number of objects to return, between `1` and `100`.
 * @param order - Order the results by the creation time. Supported values are `"asc"` (ascending), `"desc"` (descending), and `"normal"` (descending with reversed cursor semantics where `before` fetches older records and `after` fetches newer records).
 */
export const OrganizationMembershipGroupsControllerListGroups =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: OrganizationMembershipGroupsControllerListGroupsInput,
    outputSchema: OrganizationMembershipGroupsControllerListGroupsOutput,
    errors: [NotFound] as const,
  }));
