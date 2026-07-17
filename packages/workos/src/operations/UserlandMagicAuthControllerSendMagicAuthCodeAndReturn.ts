import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface UserlandMagicAuthControllerSendMagicAuthCodeAndReturnInput {
  email: string;
  invitation_token?: string;
}
export const UserlandMagicAuthControllerSendMagicAuthCodeAndReturnInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    email: Schema.String,
    invitation_token: Schema.optional(Schema.String),
  }).pipe(
    T.Http({ method: "POST", path: "/user_management/magic_auth" }),
  ) as unknown as GeneratedStructCodec<UserlandMagicAuthControllerSendMagicAuthCodeAndReturnInput>;

// Output Schema
export interface UserlandMagicAuthControllerSendMagicAuthCodeAndReturnOutput {
  object: "magic_auth";
  id: string;
  user_id: string;
  email: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  code: string;
}
export const UserlandMagicAuthControllerSendMagicAuthCodeAndReturnOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["magic_auth"]),
    id: Schema.String,
    user_id: Schema.String,
    email: Schema.String,
    expires_at: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    code: Schema.String,
  }) as unknown as GeneratedStructCodec<UserlandMagicAuthControllerSendMagicAuthCodeAndReturnOutput>;

// The operation
/**
 * Create a Magic Auth code
 *
 * Creates a one-time authentication code that can be sent to the user's email address. The code expires in 10 minutes. To verify the code, [authenticate the user with Magic Auth](/reference/authkit/authentication/magic-auth).
 */
export const UserlandMagicAuthControllerSendMagicAuthCodeAndReturn =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: UserlandMagicAuthControllerSendMagicAuthCodeAndReturnInput,
    outputSchema: UserlandMagicAuthControllerSendMagicAuthCodeAndReturnOutput,
    errors: [BadRequest, UnprocessableEntity] as const,
  }));
