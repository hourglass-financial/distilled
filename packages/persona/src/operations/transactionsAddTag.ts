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
export interface TransactionsAddTagInput {
  transactionId: string;
  include?: string;
  fields?: Record<string, string>;
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
  meta?: { "tag-name"?: string; "tag-id"?: string };
}
export const TransactionsAddTagInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    transactionId: Schema.String.pipe(T.PathParam()),
    include: Schema.optional(Schema.String).pipe(T.HttpQuery("include")),
    fields: Schema.optional(Schema.Record(Schema.String, Schema.String)).pipe(
      T.HttpQuery("fields", { style: "deepObject", explode: true }),
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
    meta: Schema.optional(
      Schema.Struct({
        "tag-name": Schema.optional(Schema.String),
        "tag-id": Schema.optional(Schema.String),
      }),
    ),
  }).pipe(
    T.Http({ method: "POST", path: "/transactions/{transactionId}/add-tag" }),
  ) as unknown as Schema.Codec<TransactionsAddTagInput>;

// Output Schema
export interface TransactionsAddTagOutput {
  data: {
    id?: string;
    type?: string;
    attributes?: {
      status?: string;
      "reference-id"?: string | null;
      fields?: Record<string, unknown>;
      tags?: ReadonlyArray<string>;
      "created-at"?: string;
      "updated-at"?: string | null;
    };
    relationships?: {
      reviewer?: { data?: { type?: string; id?: string } | null };
      "transaction-label"?: { data?: { type?: string; id?: string } | null };
      "transaction-type"?: { data?: { type?: string; id?: string } };
      "related-objects"?: {
        data?: ReadonlyArray<{ type?: string; id?: string }>;
      };
    };
  };
}
export const TransactionsAddTagOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Struct({
      id: Schema.optional(Schema.String),
      type: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          status: Schema.optional(Schema.String),
          "reference-id": Schema.optional(Schema.NullOr(Schema.String)),
          fields: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
          tags: Schema.optional(Schema.Array(Schema.String)),
          "created-at": Schema.optional(Schema.String),
          "updated-at": Schema.optional(Schema.NullOr(Schema.String)),
        }),
      ),
      relationships: Schema.optional(
        Schema.Struct({
          reviewer: Schema.optional(
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
          "transaction-label": Schema.optional(
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
          "transaction-type": Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.Struct({
                  type: Schema.optional(Schema.String),
                  id: Schema.optional(Schema.String),
                }),
              ),
            }),
          ),
          "related-objects": Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.Array(
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
  }) as unknown as Schema.Codec<TransactionsAddTagOutput>;

// The operation
/**
 * Add tag to Transaction
 *
 * Adds a tag to a Transaction. Create a new tag if the tag does not already exist. No effect if the transaction already has the tag.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 * @param transactionId - ID of the transaction to add tag on.
 */
export const transactionsAddTag = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: TransactionsAddTagInput,
  outputSchema: TransactionsAddTagOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
