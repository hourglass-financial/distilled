import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound, UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface AuthenticationChallengesControllerVerifyInput {
  id: string;
  code: string;
}
export const AuthenticationChallengesControllerVerifyInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    code: Schema.String,
  }).pipe(
    T.Http({ method: "POST", path: "/auth/challenges/{id}/verify" }),
  ) as unknown as GeneratedStructCodec<AuthenticationChallengesControllerVerifyInput>;

// Output Schema
export interface AuthenticationChallengesControllerVerifyOutput {
  challenge: {
    object: "authentication_challenge";
    id: string;
    expires_at?: string;
    code?: string;
    authentication_factor_id: string;
    created_at: string;
    updated_at: string;
  };
  valid: boolean;
}
export const AuthenticationChallengesControllerVerifyOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    challenge: Schema.Struct({
      object: Schema.Literals(["authentication_challenge"]),
      id: Schema.String,
      expires_at: Schema.optional(Schema.String),
      code: Schema.optional(Schema.String),
      authentication_factor_id: Schema.String,
      created_at: Schema.String,
      updated_at: Schema.String,
    }),
    valid: Schema.Boolean,
  }) as unknown as GeneratedStructCodec<AuthenticationChallengesControllerVerifyOutput>;

// The operation
/**
 * Verify Challenge
 *
 * Verifies an Authentication Challenge.
 *
 * @param id - The unique ID of the Authentication Challenge.
 */
export const AuthenticationChallengesControllerVerify =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: AuthenticationChallengesControllerVerifyInput,
    outputSchema: AuthenticationChallengesControllerVerifyOutput,
    errors: [BadRequest, NotFound, UnprocessableEntity] as const,
  }));
