import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { Forbidden, NotFound, UnprocessableEntity } from "../errors.ts";
import { SensitiveOutputString } from "../sensitive.ts";
import * as Redacted from "effect/Redacted";

// Input Schema
export interface UserlandUsersControllerCreatePasswordResetTokenInput {
  email: string;
}
export const UserlandUsersControllerCreatePasswordResetTokenInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    email: Schema.String,
  }).pipe(
    T.Http({ method: "POST", path: "/user_management/password_reset" }),
  ) as unknown as GeneratedStructCodec<UserlandUsersControllerCreatePasswordResetTokenInput>;

// Output Schema
export interface UserlandUsersControllerCreatePasswordResetTokenOutput {
  object: "password_reset";
  id: string;
  user_id: string;
  email: string;
  expires_at: string;
  created_at: string;
  password_reset_token: Redacted.Redacted<string>;
  password_reset_url: Redacted.Redacted<string>;
}
export const UserlandUsersControllerCreatePasswordResetTokenOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["password_reset"]),
    id: Schema.String,
    user_id: Schema.String,
    email: Schema.String,
    expires_at: Schema.String,
    created_at: Schema.String,
    password_reset_token: SensitiveOutputString,
    password_reset_url: SensitiveOutputString,
  }) as unknown as GeneratedStructCodec<UserlandUsersControllerCreatePasswordResetTokenOutput>;

// The operation
/**
 * Create a password reset token
 *
 * Creates a one-time token that can be used to reset a user's password.
 */
export const UserlandUsersControllerCreatePasswordResetToken =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: UserlandUsersControllerCreatePasswordResetTokenInput,
    outputSchema: UserlandUsersControllerCreatePasswordResetTokenOutput,
    errors: [Forbidden, NotFound, UnprocessableEntity] as const,
  }));
