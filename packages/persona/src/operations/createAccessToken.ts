import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import {
  BadRequest,
  Forbidden,
  NotFound,
  Conflict,
  UnprocessableEntity,
} from "../errors.ts";
import { SensitiveOutputString } from "../sensitive.ts";

// Input Schema
export const CreateAccessTokenInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
  {
    keyInflection: Schema.optional(
      Schema.Literals(["camel", "kebab", "snake"]),
    ).pipe(T.HttpHeader("Key-Inflection")),
    idempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Idempotency-Key"),
    ),
    personaVersion: Schema.optional(
      Schema.Literals([
        "2025-12-08",
        "2025-10-27",
        "2023-01-05",
        "2022-09-01",
        "2021-08-18",
        "2021-07-05",
        "2021-02-21",
        "2020-05-18",
      ]),
    ).pipe(T.HttpHeader("Persona-Version")),
  },
).pipe(
  T.Http({
    method: "POST",
    path: "/oauth/token",
    contentType: "form-urlencoded",
  }),
);
export type CreateAccessTokenInput = typeof CreateAccessTokenInput.Type;

// Output Schema
export const CreateAccessTokenOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    "access-token": SensitiveOutputString,
    "expires-in": Schema.Number,
    scope: Schema.String,
    "token-type": Schema.Literals(["bearer", "Bearer"]),
  });
export type CreateAccessTokenOutput = typeof CreateAccessTokenOutput.Type;

// The operation
/**
 * Create Access Token
 *
 * Exchange a credential for an access token. Supports two grant types:
 * - `authorization_code`: Exchange an authorization code for an access token
 * (cross-org data sharing).
 * - `client_credentials`: Exchange a signed JWT assertion (`private_key_jwt`)
 * for a short-lived access token (machine-to-machine auth, RFC 7523).
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 */
export const createAccessToken = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateAccessTokenInput,
  outputSchema: CreateAccessTokenOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
