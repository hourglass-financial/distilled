import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { Forbidden, NotFound, UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface DirectoryUsersControllerListInput {
  before?: string;
  after?: string;
  limit?: number;
  order?: "normal" | "desc" | "asc";
  directory?: string;
  group?: string;
  idp_id?: string;
  email?: string;
}
export const DirectoryUsersControllerListInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    before: Schema.optional(Schema.String).pipe(T.HttpQuery("before")),
    after: Schema.optional(Schema.String).pipe(T.HttpQuery("after")),
    limit: Schema.optional(Schema.Number).pipe(T.HttpQuery("limit")),
    order: Schema.optional(Schema.Literals(["normal", "desc", "asc"])).pipe(
      T.HttpQuery("order"),
    ),
    directory: Schema.optional(Schema.String).pipe(T.HttpQuery("directory")),
    group: Schema.optional(Schema.String).pipe(T.HttpQuery("group")),
    idp_id: Schema.optional(Schema.String).pipe(T.HttpQuery("idp_id")),
    email: Schema.optional(Schema.String).pipe(T.HttpQuery("email")),
  }).pipe(
    T.Http({ method: "GET", path: "/directory_users" }),
  ) as unknown as GeneratedStructCodec<DirectoryUsersControllerListInput>;

// Output Schema
export interface DirectoryUsersControllerListOutput {
  object: "list";
  data: ReadonlyArray<{
    object: "directory_user";
    id: string;
    directory_id: string;
    organization_id: string;
    idp_id: string;
    email: string | null;
    first_name?: string | null;
    last_name?: string | null;
    name?: string | null;
    emails?: ReadonlyArray<{
      primary?: boolean;
      type?: string;
      value?: string | null;
    }>;
    job_title?: string | null;
    username?: string | null;
    state: "active" | "suspended" | "inactive";
    raw_attributes: Record<string, unknown>;
    custom_attributes: Record<string, unknown>;
    role?: { slug: string };
    roles?: ReadonlyArray<{ slug: string }>;
    created_at: string;
    updated_at: string;
    groups: ReadonlyArray<{
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
  }>;
  list_metadata: { before: string | null; after: string | null };
}
export const DirectoryUsersControllerListOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["list"]),
    data: Schema.Array(
      Schema.Struct({
        object: Schema.Literals(["directory_user"]),
        id: Schema.String,
        directory_id: Schema.String,
        organization_id: Schema.String,
        idp_id: Schema.String,
        email: Schema.NullOr(Schema.String),
        first_name: Schema.optional(Schema.NullOr(Schema.String)),
        last_name: Schema.optional(Schema.NullOr(Schema.String)),
        name: Schema.optional(Schema.NullOr(Schema.String)),
        emails: Schema.optional(
          Schema.Array(
            Schema.Struct({
              primary: Schema.optional(Schema.Boolean),
              type: Schema.optional(Schema.String),
              value: Schema.optional(Schema.NullOr(Schema.String)),
            }),
          ),
        ),
        job_title: Schema.optional(Schema.NullOr(Schema.String)),
        username: Schema.optional(Schema.NullOr(Schema.String)),
        state: Schema.Literals(["active", "suspended", "inactive"]),
        raw_attributes: Schema.Record(Schema.String, Schema.Unknown),
        custom_attributes: Schema.Record(Schema.String, Schema.Unknown),
        role: Schema.optional(
          Schema.Struct({
            slug: Schema.String,
          }),
        ),
        roles: Schema.optional(
          Schema.Array(
            Schema.Struct({
              slug: Schema.String,
            }),
          ),
        ),
        created_at: Schema.String,
        updated_at: Schema.String,
        groups: Schema.Array(
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
      }),
    ),
    list_metadata: Schema.Struct({
      before: Schema.NullOr(Schema.String),
      after: Schema.NullOr(Schema.String),
    }),
  }) as unknown as GeneratedStructCodec<DirectoryUsersControllerListOutput>;

// The operation
/**
 * List Directory Users
 *
 * Get a list of all of existing Directory Users matching the criteria specified.
 *
 * @param before - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list. For example, if you make a list request and receive 100 objects, ending with `"obj_123"`, your subsequent call can include `before="obj_123"` to fetch a new batch of objects before `"obj_123"`.
 * @param after - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list. For example, if you make a list request and receive 100 objects, ending with `"obj_123"`, your subsequent call can include `after="obj_123"` to fetch a new batch of objects after `"obj_123"`.
 * @param limit - Upper limit on the number of objects to return, between `1` and `100`.
 * @param order - Order the results by the creation time. Supported values are `"asc"` (ascending), `"desc"` (descending), and `"normal"` (descending with reversed cursor semantics where `before` fetches older records and `after` fetches newer records).
 * @param directory - Unique identifier of the WorkOS Directory. This value can be obtained from the WorkOS dashboard or from the WorkOS API.
 * @param group - Unique identifier of the WorkOS Directory Group. This value can be obtained from the WorkOS API.
 * @param idp_id - Filter Directory Users by the identity provider's unique identifier (`idp_id`). Requires the `directory` parameter to also be provided.
 * @param email - Filter Directory Users by their primary email address. Requires the `directory` parameter to also be provided.
 */
export const DirectoryUsersControllerList =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: DirectoryUsersControllerListInput,
    outputSchema: DirectoryUsersControllerListOutput,
    errors: [Forbidden, NotFound, UnprocessableEntity] as const,
  }));
