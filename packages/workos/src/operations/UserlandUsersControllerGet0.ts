import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { NotFound } from "../errors.ts";

// Input Schema
export interface UserlandUsersControllerGet0Input {
  id: string;
}
export const UserlandUsersControllerGet0Input =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
  }).pipe(
    T.Http({ method: "GET", path: "/user_management/users/{id}" }),
  ) as unknown as GeneratedStructCodec<UserlandUsersControllerGet0Input>;

// Output Schema
export interface UserlandUsersControllerGet0Output {
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
}
export const UserlandUsersControllerGet0Output =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["user"]),
    id: Schema.String,
    first_name: Schema.NullOr(Schema.String),
    last_name: Schema.NullOr(Schema.String),
    name: Schema.optional(Schema.NullOr(Schema.String)),
    profile_picture_url: Schema.NullOr(Schema.String),
    email: Schema.String,
    email_verified: Schema.Boolean,
    external_id: Schema.NullOr(Schema.String),
    metadata: Schema.optional(Schema.Record(Schema.String, Schema.String)),
    last_sign_in_at: Schema.NullOr(Schema.String),
    locale: Schema.optional(Schema.NullOr(Schema.String)),
    created_at: Schema.String,
    updated_at: Schema.String,
  }) as unknown as GeneratedStructCodec<UserlandUsersControllerGet0Output>;

// The operation
/**
 * Get a user
 *
 * Get the details of an existing user.
 *
 * @param id - The unique ID of the user.
 */
export const UserlandUsersControllerGet0 = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: UserlandUsersControllerGet0Input,
    outputSchema: UserlandUsersControllerGet0Output,
    errors: [NotFound] as const,
  }),
);
