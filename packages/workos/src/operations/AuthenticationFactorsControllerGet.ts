import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { NotFound } from "../errors.ts";

// Input Schema
export interface AuthenticationFactorsControllerGetInput {
  id: string;
}
export const AuthenticationFactorsControllerGetInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
  }).pipe(
    T.Http({ method: "GET", path: "/auth/factors/{id}" }),
  ) as unknown as GeneratedStructCodec<AuthenticationFactorsControllerGetInput>;

// Output Schema
export interface AuthenticationFactorsControllerGetOutput {
  object: "authentication_factor";
  id: string;
  type: "generic_otp" | "sms" | "totp" | "webauthn";
  user_id?: string;
  sms?: { phone_number: string };
  totp?: { issuer: string; user: string };
  created_at: string;
  updated_at: string;
}
export const AuthenticationFactorsControllerGetOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["authentication_factor"]),
    id: Schema.String,
    type: Schema.Literals(["generic_otp", "sms", "totp", "webauthn"]),
    user_id: Schema.optional(Schema.String),
    sms: Schema.optional(
      Schema.Struct({
        phone_number: Schema.String,
      }),
    ),
    totp: Schema.optional(
      Schema.Struct({
        issuer: Schema.String,
        user: Schema.String,
      }),
    ),
    created_at: Schema.String,
    updated_at: Schema.String,
  }) as unknown as GeneratedStructCodec<AuthenticationFactorsControllerGetOutput>;

// The operation
/**
 * Get Factor
 *
 * Gets an Authentication Factor.
 *
 * @param id - The unique ID of the Factor.
 */
export const AuthenticationFactorsControllerGet =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: AuthenticationFactorsControllerGetInput,
    outputSchema: AuthenticationFactorsControllerGetOutput,
    errors: [NotFound] as const,
  }));
