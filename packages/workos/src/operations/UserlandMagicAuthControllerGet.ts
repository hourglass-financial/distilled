import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { NotFound } from "../errors.ts";

// Input Schema
export interface UserlandMagicAuthControllerGetInput {
  id: string;
}
export const UserlandMagicAuthControllerGetInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
  }).pipe(
    T.Http({ method: "GET", path: "/user_management/magic_auth/{id}" }),
  ) as unknown as GeneratedStructCodec<UserlandMagicAuthControllerGetInput>;

// Output Schema
export interface UserlandMagicAuthControllerGetOutput {
  object: "magic_auth";
  id: string;
  user_id: string;
  email: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  code: string;
}
export const UserlandMagicAuthControllerGetOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["magic_auth"]),
    id: Schema.String,
    user_id: Schema.String,
    email: Schema.String,
    expires_at: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    code: Schema.String,
  }) as unknown as GeneratedStructCodec<UserlandMagicAuthControllerGetOutput>;

// The operation
/**
 * Get Magic Auth code details
 *
 * Get the details of an existing [Magic Auth](/reference/authkit/magic-auth) code that can be used to send an email to a user for authentication.
 *
 * @param id - The unique ID of the Magic Auth code.
 */
export const UserlandMagicAuthControllerGet =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: UserlandMagicAuthControllerGetInput,
    outputSchema: UserlandMagicAuthControllerGetOutput,
    errors: [NotFound] as const,
  }));
