import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { UnprocessableEntity } from "../errors.ts";
import { SensitiveString, SensitiveOutputString } from "../sensitive.ts";
import * as Redacted from "effect/Redacted";

// Input Schema
export interface UserlandUserAuthenticationFactorsControllerCreate0Input {
  userlandUserId: string;
  type: "totp";
  totp_issuer?: string;
  totp_user?: string;
  totp_secret?: string | Redacted.Redacted<string>;
}
export const UserlandUserAuthenticationFactorsControllerCreate0Input =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    userlandUserId: Schema.String.pipe(T.PathParam()),
    type: Schema.Literals(["totp"]),
    totp_issuer: Schema.optional(Schema.String),
    totp_user: Schema.optional(Schema.String),
    totp_secret: Schema.optional(SensitiveString),
  }).pipe(
    T.Http({
      method: "POST",
      path: "/user_management/users/{userlandUserId}/auth_factors",
    }),
  ) as unknown as GeneratedStructCodec<UserlandUserAuthenticationFactorsControllerCreate0Input>;

// Output Schema
export interface UserlandUserAuthenticationFactorsControllerCreate0Output {
  authentication_factor: {
    object: "authentication_factor";
    id: string;
    type: "generic_otp" | "sms" | "totp" | "webauthn";
    user_id?: string;
    sms?: { phone_number: string };
    totp?: {
      issuer: string;
      user: string;
      secret: Redacted.Redacted<string>;
      qr_code: string;
      uri: string;
    };
    created_at: string;
    updated_at: string;
  };
  authentication_challenge: {
    object: "authentication_challenge";
    id: string;
    expires_at?: string;
    code?: string;
    authentication_factor_id: string;
    created_at: string;
    updated_at: string;
  };
}
export const UserlandUserAuthenticationFactorsControllerCreate0Output =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    authentication_factor: Schema.Struct({
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
          secret: SensitiveOutputString,
          qr_code: Schema.String,
          uri: Schema.String,
        }),
      ),
      created_at: Schema.String,
      updated_at: Schema.String,
    }),
    authentication_challenge: Schema.Struct({
      object: Schema.Literals(["authentication_challenge"]),
      id: Schema.String,
      expires_at: Schema.optional(Schema.String),
      code: Schema.optional(Schema.String),
      authentication_factor_id: Schema.String,
      created_at: Schema.String,
      updated_at: Schema.String,
    }),
  }) as unknown as GeneratedStructCodec<UserlandUserAuthenticationFactorsControllerCreate0Output>;

// The operation
/**
 * Enroll an authentication factor
 *
 * Enrolls a user in a new [authentication factor](/reference/authkit/mfa/authentication-factor).
 *
 * @param userlandUserId - The ID of the [user](/reference/authkit/user).
 */
export const UserlandUserAuthenticationFactorsControllerCreate0 =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: UserlandUserAuthenticationFactorsControllerCreate0Input,
    outputSchema: UserlandUserAuthenticationFactorsControllerCreate0Output,
    errors: [UnprocessableEntity] as const,
  }));
