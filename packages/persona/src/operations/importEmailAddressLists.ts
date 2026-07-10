import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import {
  BadRequest,
  Forbidden,
  Conflict,
  UnprocessableEntity,
} from "../errors.ts";

// Input Schema
export const ImportEmailAddressListsInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
    data: Schema.Struct({
      attributes: Schema.Struct({
        file: Schema.Struct({
          data: Schema.optional(Schema.String),
          filename: Schema.optional(Schema.String),
        }),
        "list-id": Schema.String,
      }),
    }),
  }).pipe(
    T.Http({ method: "POST", path: "/importer/list-item/email-addresses" }),
  );
export type ImportEmailAddressListsInput =
  typeof ImportEmailAddressListsInput.Type;

// Output Schema
export const ImportEmailAddressListsOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Struct({
      id: Schema.optional(Schema.String),
      type: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          "completed-at": Schema.optional(Schema.NullOr(Schema.String)),
          "created-at": Schema.optional(Schema.String),
          "duplicate-count": Schema.optional(Schema.Number),
          "error-count": Schema.optional(Schema.Number),
          status: Schema.optional(Schema.String),
          "successful-count": Schema.optional(Schema.Number),
        }),
      ),
    }),
  });
export type ImportEmailAddressListsOutput =
  typeof ImportEmailAddressListsOutput.Type;

// The operation
/**
 * Import Email Address Lists
 *
 * Bulk import email address List Items by uploading a CSV file.
 * Each row should be the details for a new List Item. The columns we allow are:
 * - value
 * - match_type (either 'email_address' or 'domain')
 * A match_type of 'email_address' will need to match the entire email address of an individual, while a match_type of 'domain' will match on the email address domain of an individual (i.e. all email addresses with domain 'gmail.com').
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const importEmailAddressLists = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: ImportEmailAddressListsInput,
    outputSchema: ImportEmailAddressListsOutput,
    errors: [BadRequest, Forbidden, Conflict, UnprocessableEntity] as const,
  }),
);
