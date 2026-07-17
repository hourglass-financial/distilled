import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { NotFound } from "../errors.ts";

// Input Schema
export interface UserApiKeysControllerListInput {
  userId: string;
  before?: string;
  after?: string;
  limit?: number;
  order?: "normal" | "desc" | "asc";
  organization_id?: string;
}
export const UserApiKeysControllerListInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    userId: Schema.String.pipe(T.PathParam()),
    before: Schema.optional(Schema.String).pipe(T.HttpQuery("before")),
    after: Schema.optional(Schema.String).pipe(T.HttpQuery("after")),
    limit: Schema.optional(Schema.Number).pipe(T.HttpQuery("limit")),
    order: Schema.optional(Schema.Literals(["normal", "desc", "asc"])).pipe(
      T.HttpQuery("order"),
    ),
    organization_id: Schema.optional(Schema.String).pipe(
      T.HttpQuery("organization_id"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/user_management/users/{userId}/api_keys" }),
  ) as unknown as GeneratedStructCodec<UserApiKeysControllerListInput>;

// Output Schema
export interface UserApiKeysControllerListOutput {
  object: "list";
  data: ReadonlyArray<{
    object: "api_key";
    id: string;
    owner: { type: "user"; id: string; organization_id: string };
    name: string;
    obfuscated_value: string;
    last_used_at: string | null;
    expires_at: string | null;
    permissions: ReadonlyArray<string>;
    created_at: string;
    updated_at: string;
  }>;
  list_metadata: { before: string | null; after: string | null };
}
export const UserApiKeysControllerListOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["list"]),
    data: Schema.Array(
      Schema.Struct({
        object: Schema.Literals(["api_key"]),
        id: Schema.String,
        owner: Schema.Struct({
          type: Schema.Literals(["user"]),
          id: Schema.String,
          organization_id: Schema.String,
        }),
        name: Schema.String,
        obfuscated_value: Schema.String,
        last_used_at: Schema.NullOr(Schema.String),
        expires_at: Schema.NullOr(Schema.String),
        permissions: Schema.Array(Schema.String),
        created_at: Schema.String,
        updated_at: Schema.String,
      }),
    ),
    list_metadata: Schema.Struct({
      before: Schema.NullOr(Schema.String),
      after: Schema.NullOr(Schema.String),
    }),
  }) as unknown as GeneratedStructCodec<UserApiKeysControllerListOutput>;

// The operation
/**
 * List API keys for a user
 *
 * Get a list of API keys owned by a specific user.
 *
 * @param userId - Unique identifier of the user.
 * @param before - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list.
 * @param after - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list.
 * @param limit - Upper limit on the number of objects to return, between `1` and `100`.
 * @param order - Order the results by the creation time.
 * @param organization_id - The ID of the organization to filter user API keys by. When provided, only API keys created against that organization membership are returned.
 */
export const UserApiKeysControllerList = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: UserApiKeysControllerListInput,
    outputSchema: UserApiKeysControllerListOutput,
    errors: [NotFound] as const,
  }),
);
