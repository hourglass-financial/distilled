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
export const ConsolidateIntoAnAccountInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    accountId: Schema.String.pipe(T.PathParam()),
    include: Schema.optional(Schema.String).pipe(T.HttpQuery("include")),
    fields: Schema.optional(Schema.Record(Schema.String, Schema.String)).pipe(
      T.HttpQuery("fields"),
    ),
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
    meta: Schema.Struct({
      "source-account-ids": Schema.Array(Schema.String),
    }),
  }).pipe(
    T.Http({ method: "POST", path: "/accounts/{accountId}/consolidate" }),
  );
export type ConsolidateIntoAnAccountInput =
  typeof ConsolidateIntoAnAccountInput.Type;

// Output Schema
export const ConsolidateIntoAnAccountOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Void;
export type ConsolidateIntoAnAccountOutput =
  typeof ConsolidateIntoAnAccountOutput.Type;

// The operation
/**
 * Consolidate Accounts
 *
 * Consolidates several source Accounts' information into one target Account. Any Persona resource associated with the source Account will be transferred over to the destination Account. However, the Account's attributes will **not** be transferred. After consolidation, you can update the destination Account's attributes using the [Account update endpoint](https://docs.withpersona.com/api-reference/accounts/update-an-account).
 * This endpoint can be used to clean up duplicate Accounts.
 * Note: A source account can only be consolidated once. Afterwards, the source account will be archived and unable to be used moving forward - any attempts to create an inquiry attached to the source account will fail.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 * @param accountId - Destination Account ID
 */
export const consolidateIntoAnAccount = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: ConsolidateIntoAnAccountInput,
    outputSchema: ConsolidateIntoAnAccountOutput,
    errors: [
      BadRequest,
      Forbidden,
      NotFound,
      Conflict,
      UnprocessableEntity,
    ] as const,
  }),
);
