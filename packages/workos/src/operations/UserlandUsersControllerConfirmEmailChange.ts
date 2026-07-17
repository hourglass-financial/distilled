import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import {
  BadRequest,
  NotFound,
  Conflict,
  UnprocessableEntity,
} from "../errors.ts";

// Input Schema
export interface UserlandUsersControllerConfirmEmailChangeInput {
  id: string;
  code: string;
}
export const UserlandUsersControllerConfirmEmailChangeInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    code: Schema.String,
  }).pipe(
    T.Http({
      method: "POST",
      path: "/user_management/users/{id}/email_change/confirm",
    }),
  ) as unknown as GeneratedStructCodec<UserlandUsersControllerConfirmEmailChangeInput>;

// Output Schema
export interface UserlandUsersControllerConfirmEmailChangeOutput {
  object: "email_change_confirmation";
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
export const UserlandUsersControllerConfirmEmailChangeOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["email_change_confirmation"]),
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
  }) as unknown as GeneratedStructCodec<UserlandUsersControllerConfirmEmailChangeOutput>;

// The operation
/**
 * Confirm email change
 *
 * Confirms an email change using the one-time code received by the user.
 *
 * @param id - The unique ID of the user.
 */
export const UserlandUsersControllerConfirmEmailChange =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: UserlandUsersControllerConfirmEmailChangeInput,
    outputSchema: UserlandUsersControllerConfirmEmailChangeOutput,
    errors: [BadRequest, NotFound, Conflict, UnprocessableEntity] as const,
  }));
