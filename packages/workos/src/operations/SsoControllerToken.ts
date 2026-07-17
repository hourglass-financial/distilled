import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound, UnprocessableEntity } from "../errors.ts";
import { SensitiveOutputString } from "../sensitive.ts";
import * as Redacted from "effect/Redacted";

// Input Schema
export interface SsoControllerTokenInput {
  client_id: string;
  client_secret: string;
  code: string;
  grant_type: "authorization_code";
}
export const SsoControllerTokenInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    client_id: Schema.String.pipe(T.HttpQuery("client_id")),
    client_secret: Schema.String.pipe(T.HttpQuery("client_secret")),
    code: Schema.String.pipe(T.HttpQuery("code")),
    grant_type: Schema.Literals(["authorization_code"]).pipe(
      T.HttpQuery("grant_type"),
    ),
  }).pipe(
    T.Http({ method: "POST", path: "/sso/token" }),
  ) as unknown as GeneratedStructCodec<SsoControllerTokenInput>;

// Output Schema
export interface SsoControllerTokenOutput {
  token_type: "Bearer";
  access_token: Redacted.Redacted<string>;
  expires_in: number;
  profile: {
    object: "profile";
    id: string;
    organization_id: string | null;
    connection_id: string;
    connection_type:
      | "Pending"
      | "ADFSSAML"
      | "AdpOidc"
      | "AppleOAuth"
      | "Auth0Migration"
      | "Auth0SAML"
      | "AzureSAML"
      | "BitbucketOAuth"
      | "CasSAML"
      | "ClassLinkSAML"
      | "CleverOIDC"
      | "CloudflareSAML"
      | "CyberArkSAML"
      | "DiscordOAuth"
      | "DuoSAML"
      | "EntraIdOIDC"
      | "GenericOIDC"
      | "GenericSAML"
      | "GitHubOAuth"
      | "GitLabOAuth"
      | "GoogleOAuth"
      | "GoogleOIDC"
      | "GoogleSAML"
      | "IntuitOAuth"
      | "JumpCloudSAML"
      | "KeycloakSAML"
      | "LastPassSAML"
      | "LinkedInOAuth"
      | "LoginGovOidc"
      | "MagicLink"
      | "MicrosoftOAuth"
      | "MiniOrangeSAML"
      | "NetIqSAML"
      | "OktaOIDC"
      | "OktaSAML"
      | "OneLoginSAML"
      | "OracleSAML"
      | "PingFederateSAML"
      | "PingOneSAML"
      | "RipplingSAML"
      | "SalesforceSAML"
      | "ShibbolethGenericSAML"
      | "ShibbolethSAML"
      | "SimpleSamlPhpSAML"
      | "SalesforceOAuth"
      | "SlackOAuth"
      | "TestIdp"
      | "VercelMarketplaceOAuth"
      | "VercelOAuth"
      | "VMwareSAML"
      | "XeroOAuth";
    idp_id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    name: string | null;
    role?: { slug: string } | null;
    roles?: ReadonlyArray<{ slug: string }> | null;
    groups?: ReadonlyArray<string>;
    custom_attributes?: Record<string, unknown>;
    raw_attributes: Record<string, unknown>;
  };
  oauth_tokens?: {
    provider: string;
    refresh_token: Redacted.Redacted<string>;
    access_token: Redacted.Redacted<string>;
    expires_at: number;
    scopes: ReadonlyArray<string>;
  };
}
export const SsoControllerTokenOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    token_type: Schema.Literals(["Bearer"]),
    access_token: SensitiveOutputString,
    expires_in: Schema.Number,
    profile: Schema.Struct({
      object: Schema.Literals(["profile"]),
      id: Schema.String,
      organization_id: Schema.NullOr(Schema.String),
      connection_id: Schema.String,
      connection_type: Schema.Literals([
        "Pending",
        "ADFSSAML",
        "AdpOidc",
        "AppleOAuth",
        "Auth0Migration",
        "Auth0SAML",
        "AzureSAML",
        "BitbucketOAuth",
        "CasSAML",
        "ClassLinkSAML",
        "CleverOIDC",
        "CloudflareSAML",
        "CyberArkSAML",
        "DiscordOAuth",
        "DuoSAML",
        "EntraIdOIDC",
        "GenericOIDC",
        "GenericSAML",
        "GitHubOAuth",
        "GitLabOAuth",
        "GoogleOAuth",
        "GoogleOIDC",
        "GoogleSAML",
        "IntuitOAuth",
        "JumpCloudSAML",
        "KeycloakSAML",
        "LastPassSAML",
        "LinkedInOAuth",
        "LoginGovOidc",
        "MagicLink",
        "MicrosoftOAuth",
        "MiniOrangeSAML",
        "NetIqSAML",
        "OktaOIDC",
        "OktaSAML",
        "OneLoginSAML",
        "OracleSAML",
        "PingFederateSAML",
        "PingOneSAML",
        "RipplingSAML",
        "SalesforceSAML",
        "ShibbolethGenericSAML",
        "ShibbolethSAML",
        "SimpleSamlPhpSAML",
        "SalesforceOAuth",
        "SlackOAuth",
        "TestIdp",
        "VercelMarketplaceOAuth",
        "VercelOAuth",
        "VMwareSAML",
        "XeroOAuth",
      ]),
      idp_id: Schema.String,
      email: Schema.String,
      first_name: Schema.NullOr(Schema.String),
      last_name: Schema.NullOr(Schema.String),
      name: Schema.NullOr(Schema.String),
      role: Schema.optional(
        Schema.NullOr(
          Schema.Struct({
            slug: Schema.String,
          }),
        ),
      ),
      roles: Schema.optional(
        Schema.NullOr(
          Schema.Array(
            Schema.Struct({
              slug: Schema.String,
            }),
          ),
        ),
      ),
      groups: Schema.optional(Schema.Array(Schema.String)),
      custom_attributes: Schema.optional(
        Schema.Record(Schema.String, Schema.Unknown),
      ),
      raw_attributes: Schema.Record(Schema.String, Schema.Unknown),
    }),
    oauth_tokens: Schema.optional(
      Schema.Struct({
        provider: Schema.String,
        refresh_token: SensitiveOutputString,
        access_token: SensitiveOutputString,
        expires_at: Schema.Number,
        scopes: Schema.Array(Schema.String),
      }),
    ),
  }) as unknown as GeneratedStructCodec<SsoControllerTokenOutput>;

// The operation
/**
 * Get a Profile and Token
 *
 * Get an access token along with the user [Profile](/reference/sso/profile) using the code passed to your [Redirect URI](/reference/sso/get-authorization-url/redirect-uri).
 *
 * @param client_id - The client ID of the WorkOS environment.
 * @param client_secret - The client secret of the WorkOS environment.
 * @param code - The authorization code received from the authorization callback.
 * @param grant_type - The grant type for the token request.
 */
export const SsoControllerToken = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: SsoControllerTokenInput,
  outputSchema: SsoControllerTokenOutput,
  errors: [BadRequest, NotFound, UnprocessableEntity] as const,
}));
