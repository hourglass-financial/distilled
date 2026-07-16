import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import {
  BadRequest,
  Forbidden,
  NotFound,
  UnprocessableEntity,
} from "../errors.ts";
import { SensitiveString, SensitiveOutputString } from "../sensitive.ts";
import * as Redacted from "effect/Redacted";

// Input Schema
export interface UserlandSessionsControllerAuthenticate0Input {
  client_id: string;
  client_secret?: string | Redacted.Redacted<string>;
  grant_type: string;
  code?: string;
  code_verifier?: string;
  invitation_token?: string;
  ip_address?: string;
  device_id?: string;
  user_agent?: string;
  email?: string;
  password?: string | Redacted.Redacted<string>;
  refresh_token?: string | Redacted.Redacted<string>;
  organization_id?: string;
  pending_authentication_token?: string;
  authentication_challenge_id?: string;
  device_code?: string;
}
export const UserlandSessionsControllerAuthenticate0Input =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    client_id: Schema.String,
    client_secret: Schema.optional(SensitiveString),
    grant_type: Schema.String,
    code: Schema.optional(Schema.String),
    code_verifier: Schema.optional(Schema.String),
    invitation_token: Schema.optional(Schema.String),
    ip_address: Schema.optional(Schema.String),
    device_id: Schema.optional(Schema.String),
    user_agent: Schema.optional(Schema.String),
    email: Schema.optional(Schema.String),
    password: Schema.optional(SensitiveString),
    refresh_token: Schema.optional(SensitiveString),
    organization_id: Schema.optional(Schema.String),
    pending_authentication_token: Schema.optional(Schema.String),
    authentication_challenge_id: Schema.optional(Schema.String),
    device_code: Schema.optional(Schema.String),
  }).pipe(
    T.Http({ method: "POST", path: "/user_management/authenticate" }),
  ) as unknown as Schema.Codec<UserlandSessionsControllerAuthenticate0Input>;

// Output Schema
export interface UserlandSessionsControllerAuthenticate0Output {
  user?: {
    object?: string;
    id?: string;
    first_name?: string | null;
    last_name?: string | null;
    name?: string | null;
    profile_picture_url?: string | null;
    email?: string;
    email_verified?: boolean;
    external_id?: string | null;
    metadata?: Record<string, string>;
    last_sign_in_at?: string | null;
    locale?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  organization_id?: string;
  authkit_authorization_code?: string;
  access_token?: Redacted.Redacted<string>;
  refresh_token?: Redacted.Redacted<string>;
  authentication_method?:
    | "SSO"
    | "Password"
    | "Passkey"
    | "AppleOAuth"
    | "BitbucketOAuth"
    | "CrossAppAuth"
    | "DiscordOAuth"
    | "ExternalAuth"
    | "GitHubOAuth"
    | "GitLabOAuth"
    | "GoogleOAuth"
    | "IntuitOAuth"
    | "LinkedInOAuth"
    | "MicrosoftOAuth"
    | "SalesforceOAuth"
    | "SlackOAuth"
    | "VercelMarketplaceOAuth"
    | "VercelOAuth"
    | "XeroOAuth"
    | "MagicAuth"
    | "Impersonation"
    | "MigratedSession";
  impersonator?: { email: string; reason: string | null };
  oauth_tokens?: {
    provider: string;
    refresh_token: Redacted.Redacted<string>;
    access_token: Redacted.Redacted<string>;
    expires_at: number;
    scopes: ReadonlyArray<string>;
  };
}
export const UserlandSessionsControllerAuthenticate0Output =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    user: Schema.optional(
      Schema.Struct({
        object: Schema.optional(Schema.String),
        id: Schema.optional(Schema.String),
        first_name: Schema.optional(Schema.NullOr(Schema.String)),
        last_name: Schema.optional(Schema.NullOr(Schema.String)),
        name: Schema.optional(Schema.NullOr(Schema.String)),
        profile_picture_url: Schema.optional(Schema.NullOr(Schema.String)),
        email: Schema.optional(Schema.String),
        email_verified: Schema.optional(Schema.Boolean),
        external_id: Schema.optional(Schema.NullOr(Schema.String)),
        metadata: Schema.optional(Schema.Record(Schema.String, Schema.String)),
        last_sign_in_at: Schema.optional(Schema.NullOr(Schema.String)),
        locale: Schema.optional(Schema.NullOr(Schema.String)),
        created_at: Schema.optional(Schema.String),
        updated_at: Schema.optional(Schema.String),
      }),
    ),
    organization_id: Schema.optional(Schema.String),
    authkit_authorization_code: Schema.optional(Schema.String),
    access_token: Schema.optional(SensitiveOutputString),
    refresh_token: Schema.optional(SensitiveOutputString),
    authentication_method: Schema.optional(
      Schema.Literals([
        "SSO",
        "Password",
        "Passkey",
        "AppleOAuth",
        "BitbucketOAuth",
        "CrossAppAuth",
        "DiscordOAuth",
        "ExternalAuth",
        "GitHubOAuth",
        "GitLabOAuth",
        "GoogleOAuth",
        "IntuitOAuth",
        "LinkedInOAuth",
        "MicrosoftOAuth",
        "SalesforceOAuth",
        "SlackOAuth",
        "VercelMarketplaceOAuth",
        "VercelOAuth",
        "XeroOAuth",
        "MagicAuth",
        "Impersonation",
        "MigratedSession",
      ]),
    ),
    impersonator: Schema.optional(
      Schema.Struct({
        email: Schema.String,
        reason: Schema.NullOr(Schema.String),
      }),
    ),
    oauth_tokens: Schema.optional(
      Schema.Struct({
        provider: Schema.String,
        refresh_token: SensitiveOutputString,
        access_token: SensitiveOutputString,
        expires_at: Schema.Number,
        scopes: Schema.Array(Schema.String),
      }),
    ),
  }) as unknown as Schema.Codec<UserlandSessionsControllerAuthenticate0Output>;

// The operation
/**
 * Authenticate
 *
 * Authenticate a user with a specified [authentication method](/reference/authkit/authentication).
 */
export const UserlandSessionsControllerAuthenticate0 =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: UserlandSessionsControllerAuthenticate0Input,
    outputSchema: UserlandSessionsControllerAuthenticate0Output,
    errors: [BadRequest, Forbidden, NotFound, UnprocessableEntity] as const,
  }));
