import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { Forbidden, UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface DirectoriesControllerListInput {
  before?: string;
  after?: string;
  limit?: number;
  order?: "normal" | "desc" | "asc";
  organization_id?: string;
  search?: string;
  domain?: string;
}
export const DirectoriesControllerListInput =
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
    search: Schema.optional(Schema.String).pipe(T.HttpQuery("search")),
    domain: Schema.optional(Schema.String).pipe(T.HttpQuery("domain")),
  }).pipe(
    T.Http({ method: "GET", path: "/directories" }),
  ) as unknown as GeneratedStructCodec<DirectoriesControllerListInput>;

// Output Schema
export interface DirectoriesControllerListOutput {
  object: "list";
  data: ReadonlyArray<{
    object: "directory";
    id: string;
    organization_id: string;
    external_key: string;
    type:
      | "azure scim v2.0"
      | "bamboohr"
      | "breathe hr"
      | "cezanne hr"
      | "cyberark scim v2.0"
      | "fourth hr"
      | "generic scim v2.0"
      | "gsuite directory"
      | "hibob"
      | "sailpoint scim v2.0"
      | "jump cloud scim v2.0"
      | "okta scim v2.0"
      | "onelogin scim v2.0"
      | "people hr"
      | "personio"
      | "pingfederate scim v2.0"
      | "rippling scim v2.0"
      | "s3"
      | "sftp"
      | "sftp workday"
      | "workday";
    state:
      | "linked"
      | "validating"
      | "invalid_credentials"
      | "unlinked"
      | "deleting";
    name: string;
    domain?: string;
    metadata?: { users: { active: number; inactive: number }; groups: number };
    created_at: string;
    updated_at: string;
  }>;
  list_metadata: { before: string | null; after: string | null };
}
export const DirectoriesControllerListOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["list"]),
    data: Schema.Array(
      Schema.Struct({
        object: Schema.Literals(["directory"]),
        id: Schema.String,
        organization_id: Schema.String,
        external_key: Schema.String,
        type: Schema.Literals([
          "azure scim v2.0",
          "bamboohr",
          "breathe hr",
          "cezanne hr",
          "cyberark scim v2.0",
          "fourth hr",
          "generic scim v2.0",
          "gsuite directory",
          "hibob",
          "sailpoint scim v2.0",
          "jump cloud scim v2.0",
          "okta scim v2.0",
          "onelogin scim v2.0",
          "people hr",
          "personio",
          "pingfederate scim v2.0",
          "rippling scim v2.0",
          "s3",
          "sftp",
          "sftp workday",
          "workday",
        ]),
        state: Schema.Literals([
          "linked",
          "validating",
          "invalid_credentials",
          "unlinked",
          "deleting",
        ]),
        name: Schema.String,
        domain: Schema.optional(Schema.String),
        metadata: Schema.optional(
          Schema.Struct({
            users: Schema.Struct({
              active: Schema.Number,
              inactive: Schema.Number,
            }),
            groups: Schema.Number,
          }),
        ),
        created_at: Schema.String,
        updated_at: Schema.String,
      }),
    ),
    list_metadata: Schema.Struct({
      before: Schema.NullOr(Schema.String),
      after: Schema.NullOr(Schema.String),
    }),
  }) as unknown as GeneratedStructCodec<DirectoriesControllerListOutput>;

// The operation
/**
 * List Directories
 *
 * Get a list of all of your existing directories matching the criteria specified.
 *
 * @param before - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list.
 * @param after - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list.
 * @param limit - Upper limit on the number of objects to return, between `1` and `100`.
 * @param order - Order the results by the creation time.
 * @param organization_id - Filter Directories by their associated organization.
 * @param search - Searchable text to match against Directory names.
 * @param domain - Filter Directories by their associated domain.
 */
export const DirectoriesControllerList = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: DirectoriesControllerListInput,
    outputSchema: DirectoriesControllerListOutput,
    errors: [Forbidden, UnprocessableEntity] as const,
  }),
);
