import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface SsoControllerLogoutAuthorizeInput {
  profile_id: string;
}
export const SsoControllerLogoutAuthorizeInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    profile_id: Schema.String,
  }).pipe(
    T.Http({ method: "POST", path: "/sso/logout/authorize" }),
  ) as unknown as GeneratedStructCodec<SsoControllerLogoutAuthorizeInput>;

// Output Schema
export interface SsoControllerLogoutAuthorizeOutput {
  logout_url: string;
  logout_token: string;
}
export const SsoControllerLogoutAuthorizeOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    logout_url: Schema.String,
    logout_token: Schema.String,
  }) as unknown as GeneratedStructCodec<SsoControllerLogoutAuthorizeOutput>;

// The operation
/**
 * Logout Authorize
 *
 * You should call this endpoint from your server to generate a logout token which is required for the [Logout Redirect](/reference/sso/logout) endpoint.
 */
export const SsoControllerLogoutAuthorize =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: SsoControllerLogoutAuthorizeInput,
    outputSchema: SsoControllerLogoutAuthorizeOutput,
    errors: [BadRequest, NotFound] as const,
  }));
