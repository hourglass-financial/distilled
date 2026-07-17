import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, Forbidden, UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface AuthorizationResourcesControllerListInput {
  before?: string;
  after?: string;
  limit?: number;
  order?: "normal" | "desc" | "asc";
  organization_id?: string;
  resource_type_slug?: string;
  resource_external_id?: string;
  parent_resource_id?: string;
  parent_resource_type_slug?: string;
  parent_external_id?: string;
}
export const AuthorizationResourcesControllerListInput =
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
    resource_type_slug: Schema.optional(Schema.String).pipe(
      T.HttpQuery("resource_type_slug"),
    ),
    resource_external_id: Schema.optional(Schema.String).pipe(
      T.HttpQuery("resource_external_id"),
    ),
    parent_resource_id: Schema.optional(Schema.String).pipe(
      T.HttpQuery("parent_resource_id"),
    ),
    parent_resource_type_slug: Schema.optional(Schema.String).pipe(
      T.HttpQuery("parent_resource_type_slug"),
    ),
    parent_external_id: Schema.optional(Schema.String).pipe(
      T.HttpQuery("parent_external_id"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/authorization/resources" }),
  ) as unknown as GeneratedStructCodec<AuthorizationResourcesControllerListInput>;

// Output Schema
export interface AuthorizationResourcesControllerListOutput {
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
export const AuthorizationResourcesControllerListOutput =
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
  }) as unknown as GeneratedStructCodec<AuthorizationResourcesControllerListOutput>;

// The operation
/**
 * List resources
 *
 * Get a paginated list of authorization resources.
 *
 * @param before - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list. For example, if you make a list request and receive 100 objects, ending with `"obj_123"`, your subsequent call can include `before="obj_123"` to fetch a new batch of objects before `"obj_123"`.
 * @param after - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list. For example, if you make a list request and receive 100 objects, ending with `"obj_123"`, your subsequent call can include `after="obj_123"` to fetch a new batch of objects after `"obj_123"`.
 * @param limit - Upper limit on the number of objects to return, between `1` and `100`.
 * @param order - Order the results by the creation time. Supported values are `"asc"` (ascending), `"desc"` (descending), and `"normal"` (descending with reversed cursor semantics where `before` fetches older records and `after` fetches newer records).
 * @param organization_id - Filter resources by organization ID.
 * @param resource_type_slug - Filter resources by resource type slug.
 * @param resource_external_id - Filter resources by external ID.
 * @param parent_resource_id - Filter resources by parent resource ID. Mutually exclusive with `parent_resource_type_slug` and `parent_external_id`.
 * @param parent_resource_type_slug - Filter resources by parent resource type slug. Required with `parent_external_id`. Mutually exclusive with `parent_resource_id`.
 * @param parent_external_id - Filter resources by parent external ID. Required with `parent_resource_type_slug`. Mutually exclusive with `parent_resource_id`.
 */
export const AuthorizationResourcesControllerList =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: AuthorizationResourcesControllerListInput,
    outputSchema: AuthorizationResourcesControllerListOutput,
    errors: [BadRequest, Forbidden, UnprocessableEntity] as const,
  }));
