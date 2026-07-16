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

// Input Schema
export interface CreateAuthorizationInput {
  keyInflection?: "camel" | "kebab" | "snake";
  idempotencyKey?: string;
  personaVersion?:
    | "2025-12-08"
    | "2025-10-27"
    | "2023-01-05"
    | "2022-09-01"
    | "2021-08-18"
    | "2021-07-05"
    | "2021-02-21"
    | "2020-05-18";
  "client-id": string;
  "response-type": string;
  scope: string;
}
export const CreateAuthorizationInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
    "client-id": Schema.String,
    "response-type": Schema.String,
    scope: Schema.String,
  }).pipe(
    T.Http({
      method: "POST",
      path: "/oauth/authorize",
      contentType: "form-urlencoded",
    }),
  ) as unknown as Schema.Codec<CreateAuthorizationInput>;

// Output Schema
export interface CreateAuthorizationOutput {
  code: string;
  "expires-in": number;
}
export const CreateAuthorizationOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    code: Schema.String,
    "expires-in": Schema.Number,
  }) as unknown as Schema.Codec<CreateAuthorizationOutput>;

// The operation
/**
 * Create Authorization
 *
 * Authorizes another Organization to access your Inquiry, Verifications, or other Persona resources.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 */
export const createAuthorization = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateAuthorizationInput,
  outputSchema: CreateAuthorizationOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
