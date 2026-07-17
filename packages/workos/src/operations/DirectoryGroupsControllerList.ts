import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { Forbidden, NotFound, UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface DirectoryGroupsControllerListInput {
  before?: string;
  after?: string;
  limit?: number;
  order?: "normal" | "desc" | "asc";
  directory?: string;
  user?: string;
}
export const DirectoryGroupsControllerListInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    before: Schema.optional(Schema.String).pipe(T.HttpQuery("before")),
    after: Schema.optional(Schema.String).pipe(T.HttpQuery("after")),
    limit: Schema.optional(Schema.Number).pipe(T.HttpQuery("limit")),
    order: Schema.optional(Schema.Literals(["normal", "desc", "asc"])).pipe(
      T.HttpQuery("order"),
    ),
    directory: Schema.optional(Schema.String).pipe(T.HttpQuery("directory")),
    user: Schema.optional(Schema.String).pipe(T.HttpQuery("user")),
  }).pipe(
    T.Http({ method: "GET", path: "/directory_groups" }),
  ) as unknown as GeneratedStructCodec<DirectoryGroupsControllerListInput>;

// Output Schema
export interface DirectoryGroupsControllerListOutput {
  object: "list";
  data: ReadonlyArray<{
    object: "directory_group";
    id: string;
    idp_id: string;
    directory_id: string;
    organization_id: string;
    name: string;
    raw_attributes?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  }>;
  list_metadata: { before: string | null; after: string | null };
}
export const DirectoryGroupsControllerListOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["list"]),
    data: Schema.Array(
      Schema.Struct({
        object: Schema.Literals(["directory_group"]),
        id: Schema.String,
        idp_id: Schema.String,
        directory_id: Schema.String,
        organization_id: Schema.String,
        name: Schema.String,
        raw_attributes: Schema.optional(
          Schema.Record(Schema.String, Schema.Unknown),
        ),
        created_at: Schema.String,
        updated_at: Schema.String,
      }),
    ),
    list_metadata: Schema.Struct({
      before: Schema.NullOr(Schema.String),
      after: Schema.NullOr(Schema.String),
    }),
  }) as unknown as GeneratedStructCodec<DirectoryGroupsControllerListOutput>;

// The operation
/**
 * List Directory Groups
 *
 * Get a list of all of existing directory groups matching the criteria specified.
 *
 * @param before - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list. For example, if you make a list request and receive 100 objects, ending with `"obj_123"`, your subsequent call can include `before="obj_123"` to fetch a new batch of objects before `"obj_123"`.
 * @param after - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list. For example, if you make a list request and receive 100 objects, ending with `"obj_123"`, your subsequent call can include `after="obj_123"` to fetch a new batch of objects after `"obj_123"`.
 * @param limit - Upper limit on the number of objects to return, between `1` and `100`.
 * @param order - Order the results by the creation time. Supported values are `"asc"` (ascending), `"desc"` (descending), and `"normal"` (descending with reversed cursor semantics where `before` fetches older records and `after` fetches newer records).
 * @param directory - Unique identifier of the WorkOS Directory. This value can be obtained from the WorkOS dashboard or from the WorkOS API.
 * @param user - Unique identifier of the WorkOS Directory User. This value can be obtained from the WorkOS API.
 */
export const DirectoryGroupsControllerList =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: DirectoryGroupsControllerListInput,
    outputSchema: DirectoryGroupsControllerListOutput,
    errors: [Forbidden, NotFound, UnprocessableEntity] as const,
  }));
