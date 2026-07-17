import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface UserlandUsersControllerSendVerificationEmail0Input {
  id: string;
}
export const UserlandUsersControllerSendVerificationEmail0Input =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
  }).pipe(
    T.Http({
      method: "POST",
      path: "/user_management/users/{id}/email_verification/send",
    }),
  ) as unknown as GeneratedStructCodec<UserlandUsersControllerSendVerificationEmail0Input>;

// Output Schema
export interface UserlandUsersControllerSendVerificationEmail0Output {
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
}
export const UserlandUsersControllerSendVerificationEmail0Output =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
      metadata: Schema.optional(Schema.Record(Schema.String, Schema.String)),
      last_sign_in_at: Schema.NullOr(Schema.String),
      locale: Schema.optional(Schema.NullOr(Schema.String)),
      created_at: Schema.String,
      updated_at: Schema.String,
    }),
  }) as unknown as GeneratedStructCodec<UserlandUsersControllerSendVerificationEmail0Output>;

// The operation
/**
 * Send verification email
 *
 * Sends an email that contains a one-time code used to verify a user's email address.
 *
 * @param id - The ID of the user.
 */
export const UserlandUsersControllerSendVerificationEmail0 =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: UserlandUsersControllerSendVerificationEmail0Input,
    outputSchema: UserlandUsersControllerSendVerificationEmail0Output,
    errors: [BadRequest, NotFound] as const,
  }));
