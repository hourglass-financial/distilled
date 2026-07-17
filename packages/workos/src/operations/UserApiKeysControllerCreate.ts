import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound, UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface UserApiKeysControllerCreateInput {
  userId: string;
  name: string;
  organization_id: string;
  permissions?: ReadonlyArray<string>;
  expires_at?: string;
}
export const UserApiKeysControllerCreateInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    userId: Schema.String.pipe(T.PathParam()),
    name: Schema.String,
    organization_id: Schema.String,
    permissions: Schema.optional(Schema.Array(Schema.String)),
    expires_at: Schema.optional(Schema.String),
  }).pipe(
    T.Http({
      method: "POST",
      path: "/user_management/users/{userId}/api_keys",
    }),
  ) as unknown as GeneratedStructCodec<UserApiKeysControllerCreateInput>;

// Output Schema
export interface UserApiKeysControllerCreateOutput {
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
  value: string;
}
export const UserApiKeysControllerCreateOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
    value: Schema.String,
  }) as unknown as GeneratedStructCodec<UserApiKeysControllerCreateOutput>;

// The operation
/**
 * Create an API key for a user
 *
 * Create a new API key owned by a user. The user must have an active membership in the specified organization.
 *
 * @param userId - Unique identifier of the user.
 */
export const UserApiKeysControllerCreate = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: UserApiKeysControllerCreateInput,
    outputSchema: UserApiKeysControllerCreateOutput,
    errors: [BadRequest, NotFound, UnprocessableEntity] as const,
  }),
);
