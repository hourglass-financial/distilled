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
export const RedeemShareTokenInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
  data: Schema.optional(
    Schema.Struct({
      attributes: Schema.optional(
        Schema.Struct({
          "destination-id": Schema.optional(Schema.String),
        }),
      ),
    }),
  ),
  meta: Schema.optional(
    Schema.Struct({
      "field-mappings": Schema.optional(
        Schema.Array(
          Schema.Struct({
            "source-field-name": Schema.String,
            "destination-field-name": Schema.String,
          }),
        ),
      ),
    }),
  ),
}).pipe(
  T.Http({
    method: "POST",
    path: "/connect/share-tokens/{shareTokenId}/redeem",
  }),
);
export type RedeemShareTokenInput = typeof RedeemShareTokenInput.Type;

// Output Schema
export const RedeemShareTokenOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Void;
export type RedeemShareTokenOutput = typeof RedeemShareTokenOutput.Type;

// The operation
/**
 * Redeem a Share Token
 *
 * Redeems a Share Token by importing the source data into the specified destination. The destination must be in a valid state to accept the imported data.
 *
 * @param shareTokenId - The token/ID of the Share Token to be redeemed.
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const redeemShareToken = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: RedeemShareTokenInput,
  outputSchema: RedeemShareTokenOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
