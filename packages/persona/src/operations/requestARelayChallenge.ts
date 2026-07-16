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
export interface RequestARelayChallengeInput {
  keyInflection?: "camel" | "kebab" | "snake";
  personaVersion?:
    | "2025-12-08"
    | "2025-10-27"
    | "2023-01-05"
    | "2022-09-01"
    | "2021-08-18"
    | "2021-07-05"
    | "2021-02-21"
    | "2020-05-18";
  "claim-type": string;
}
export const RequestARelayChallengeInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    keyInflection: Schema.optional(
      Schema.Literals(["camel", "kebab", "snake"]),
    ).pipe(T.HttpHeader("Key-Inflection")),
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
    "claim-type": Schema.String,
  }).pipe(
    T.Http({ method: "POST", path: "/relays/challenge" }),
  ) as unknown as Schema.Codec<RequestARelayChallengeInput>;

// Output Schema
export interface RequestARelayChallengeOutput {
  challenge: string;
  "token-key": string;
  "token-key-id": string;
}
export const RequestARelayChallengeOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    challenge: Schema.String,
    "token-key": Schema.String,
    "token-key-id": Schema.String,
  }) as unknown as Schema.Codec<RequestARelayChallengeOutput>;

// The operation
/**
 * Request a Relay challenge
 *
 * Requests a Privacy Pass challenge for a claim type. The challenge materials returned here are used to obtain a Privacy Pass token, which is then redeemable to read claims from Relays with the same claim type.
 *
 * @param Key-Inflection - Determines casing for the API response.
 */
export const requestARelayChallenge = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: RequestARelayChallengeInput,
    outputSchema: RequestARelayChallengeOutput,
    errors: [
      BadRequest,
      Forbidden,
      NotFound,
      Conflict,
      UnprocessableEntity,
    ] as const,
  }),
);
