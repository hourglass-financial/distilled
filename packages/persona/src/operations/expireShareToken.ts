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
export const ExpireShareTokenInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  shareTokenId: Schema.String.pipe(T.PathParam()),
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
}).pipe(
  T.Http({
    method: "POST",
    path: "/connect/share-tokens/{shareTokenId}/expire",
  }),
);
export type ExpireShareTokenInput = typeof ExpireShareTokenInput.Type;

// Output Schema
export const ExpireShareTokenOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
  {
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
  },
);
export type ExpireShareTokenOutput = typeof ExpireShareTokenOutput.Type;

// The operation
/**
 * Expire a Share Token
 *
 * Expires a Share Token, setting its status to expired and preventing further use.
 *
 * @param shareTokenId - The token/ID of the Share Token to be expired.
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const expireShareToken = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ExpireShareTokenInput,
  outputSchema: ExpireShareTokenOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
