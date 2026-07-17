import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound, UnprocessableEntity } from "../errors.ts";
import { SensitiveString, SensitiveNullableString } from "../sensitive.ts";
import * as Redacted from "effect/Redacted";

// Input Schema
export interface UserlandUsersControllerCreate0Input {
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  email_verified?: boolean | null;
  metadata?: Record<string, string> | null;
  external_id?: string | null;
  password?: string | Redacted.Redacted<string> | null;
  password_hash?: string | Redacted.Redacted<string>;
  password_hash_type?:
    | "bcrypt"
    | "firebase-scrypt"
    | "ssha"
    | "scrypt"
    | "pbkdf2"
    | "argon2";
}
export const UserlandUsersControllerCreate0Input =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    email: Schema.String,
    first_name: Schema.optional(Schema.NullOr(Schema.String)),
    last_name: Schema.optional(Schema.NullOr(Schema.String)),
    name: Schema.optional(Schema.NullOr(Schema.String)),
    email_verified: Schema.optional(Schema.NullOr(Schema.Boolean)),
    metadata: Schema.optional(
      Schema.NullOr(Schema.Record(Schema.String, Schema.String)),
    ),
    external_id: Schema.optional(Schema.NullOr(Schema.String)),
    password: Schema.optional(SensitiveNullableString),
    password_hash: Schema.optional(SensitiveString),
    password_hash_type: Schema.optional(
      Schema.Literals([
        "bcrypt",
        "firebase-scrypt",
        "ssha",
        "scrypt",
        "pbkdf2",
        "argon2",
      ]),
    ),
  }).pipe(
    T.Http({ method: "POST", path: "/user_management/users" }),
  ) as unknown as GeneratedStructCodec<UserlandUsersControllerCreate0Input>;

// Output Schema
export interface UserlandUsersControllerCreate0Output {
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
export const UserlandUsersControllerCreate0Output =
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
  }) as unknown as GeneratedStructCodec<UserlandUsersControllerCreate0Output>;

// The operation
/**
 * Create a user
 *
 * Create a new user in the current environment.
 */
export const UserlandUsersControllerCreate0 =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: UserlandUsersControllerCreate0Input,
    outputSchema: UserlandUsersControllerCreate0Output,
    errors: [BadRequest, NotFound, UnprocessableEntity] as const,
  }));
