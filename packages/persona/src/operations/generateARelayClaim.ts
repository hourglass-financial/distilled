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
export interface GenerateARelayClaimInput {
  relayToken: string;
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
  personaRelaySecret: string;
}
export const GenerateARelayClaimInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    relayToken: Schema.String.pipe(T.PathParam()),
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
    personaRelaySecret: Schema.String.pipe(
      T.HttpHeader("Persona-Relay-Secret"),
    ),
  }).pipe(
    T.Http({ method: "POST", path: "/relays/{relayToken}/generate-claim" }),
  ) as unknown as Schema.Codec<GenerateARelayClaimInput>;

// Output Schema
export interface GenerateARelayClaimOutput {
  "claim-payload": string;
  "token-consumed": boolean;
}
export const GenerateARelayClaimOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    "claim-payload": Schema.String,
    "token-consumed": Schema.Boolean,
  }) as unknown as Schema.Codec<GenerateARelayClaimOutput>;

// The operation
/**
 * Generate a Relay claim
 *
 * Returns a relay's claim.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param relayToken - The public Relay token returned by `POST /relays`.
 * @param Persona-Relay-Secret - The `relay-secret` value returned at Relay creation. Required for every read of the claim payload; an incorrect secret returns 404.
 */
export const generateARelayClaim = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GenerateARelayClaimInput,
  outputSchema: GenerateARelayClaimOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
