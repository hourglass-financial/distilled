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
export interface CreateAPrivacyPassInput {
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
  "blinded-token": string;
  "key-id": string;
}
export const CreateAPrivacyPassInput =
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
    "blinded-token": Schema.String,
    "key-id": Schema.String,
  }).pipe(
    T.Http({ method: "POST", path: "/privacy-passes" }),
  ) as unknown as Schema.Codec<CreateAPrivacyPassInput>;

// Output Schema
export interface CreateAPrivacyPassOutput {
  "blind-sig": string;
}
export const CreateAPrivacyPassOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    "blind-sig": Schema.String,
  }) as unknown as Schema.Codec<CreateAPrivacyPassOutput>;

// The operation
/**
 * Create a Privacy Pass
 *
 * Issues a Privacy Pass token by blind-signing a client-provided blinded token (Blind RSA, RFC 9578). The returned blind signature is unblinded client-side to produce a Privacy Pass token that can later be redeemed anonymously (for example, when generating a Relay claim).
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 */
export const createAPrivacyPass = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateAPrivacyPassInput,
  outputSchema: CreateAPrivacyPassOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
