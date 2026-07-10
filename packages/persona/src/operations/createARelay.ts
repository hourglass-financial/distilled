import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import {
  BadRequest,
  Forbidden,
  Conflict,
  UnprocessableEntity,
} from "../errors.ts";
import { SensitiveOutputString } from "../sensitive.ts";

// Input Schema
export const CreateARelayInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
  "encryption-key-pem": Schema.NullOr(Schema.String),
}).pipe(T.Http({ method: "POST", path: "/relays" }));
export type CreateARelayInput = typeof CreateARelayInput.Type;

// Output Schema
export const CreateARelayOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  "relay-token": Schema.String,
  "relay-secret": SensitiveOutputString,
  "relay-session-access-token": Schema.String,
});
export type CreateARelayOutput = typeof CreateARelayOutput.Type;

// The operation
/**
 * Create a Relay
 *
 * Creates a new Relay.
 *
 * @param Key-Inflection - Determines casing for the API response.
 */
export const createARelay = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateARelayInput,
  outputSchema: CreateARelayOutput,
  errors: [BadRequest, Forbidden, Conflict, UnprocessableEntity] as const,
}));
