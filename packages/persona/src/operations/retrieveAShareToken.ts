import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound, Conflict } from "../errors.ts";

// Input Schema
export const RetrieveAShareTokenInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    shareTokenId: Schema.String.pipe(T.PathParam()),
    include: Schema.optional(Schema.String).pipe(T.HttpQuery("include")),
    fields: Schema.optional(Schema.Record(Schema.String, Schema.String)).pipe(
      T.HttpQuery("fields"),
    ),
    peekSourceData: Schema.optional(Schema.Boolean).pipe(
      T.HttpQuery("peek-source-data"),
    ),
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
  }).pipe(
    T.Http({ method: "GET", path: "/connect/share-tokens/{shareTokenId}" }),
  );
export type RetrieveAShareTokenInput = typeof RetrieveAShareTokenInput.Type;

// Output Schema
export const RetrieveAShareTokenOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Struct({
      type: Schema.optional(Schema.String),
      id: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          status: Schema.optional(Schema.String),
          direction: Schema.optional(Schema.String),
          "created-at": Schema.optional(Schema.String),
          "updated-at": Schema.optional(Schema.String),
          "pending-at": Schema.optional(Schema.NullOr(Schema.String)),
          "redeemed-at": Schema.optional(Schema.NullOr(Schema.String)),
          "expires-at": Schema.optional(Schema.NullOr(Schema.String)),
          "failed-at": Schema.optional(Schema.NullOr(Schema.String)),
          "failure-reason": Schema.optional(Schema.NullOr(Schema.String)),
          "source-data": Schema.optional(Schema.Unknown),
        }),
      ),
      relationships: Schema.optional(
        Schema.Struct({
          connection: Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.Struct({
                  type: Schema.optional(Schema.String),
                  id: Schema.optional(Schema.String),
                }),
              ),
            }),
          ),
          creator: Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.Struct({
                  type: Schema.optional(Schema.String),
                  id: Schema.optional(Schema.String),
                }),
              ),
            }),
          ),
          source: Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.Struct({
                  type: Schema.optional(Schema.String),
                  id: Schema.optional(Schema.String),
                }),
              ),
            }),
          ),
          destination: Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.NullOr(
                  Schema.Struct({
                    type: Schema.optional(Schema.String),
                    id: Schema.optional(Schema.String),
                  }),
                ),
              ),
            }),
          ),
        }),
      ),
    }),
    included: Schema.optional(Schema.Array(Schema.Unknown)),
  });
export type RetrieveAShareTokenOutput = typeof RetrieveAShareTokenOutput.Type;

// The operation
/**
 * Retrieve a Share Token
 *
 * Retrieve the information for an existing Share Token.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 * @param shareTokenId - The ID of the Share Token
 * @param peekSourceData - When `true`, the caller is the destination organization, and the destination organization
has access to the source data peek capability, the response's
`data.attributes.source-data` carries a PII-filtered source-data envelope. Defaults to
`false`; omitted from list responses regardless.

 */
export const retrieveAShareToken = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: RetrieveAShareTokenInput,
  outputSchema: RetrieveAShareTokenOutput,
  errors: [BadRequest, Forbidden, NotFound, Conflict] as const,
}));
