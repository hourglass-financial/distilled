import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface ListAllTransactionsInput {
  page?: { after?: string; before?: string; size?: number };
  fields?: Record<string, string>;
  filter?: {
    "reference-id"?: string;
    "transaction-type-id"?: string;
    identifier?: { key?: string; value?: string };
  };
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
}
export const ListAllTransactionsInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    page: Schema.optional(
      Schema.Struct({
        after: Schema.optional(Schema.String),
        before: Schema.optional(Schema.String),
        size: Schema.optional(Schema.Number),
      }),
    ).pipe(T.HttpQuery("page")),
    fields: Schema.optional(Schema.Record(Schema.String, Schema.String)).pipe(
      T.HttpQuery("fields"),
    ),
    filter: Schema.optional(
      Schema.Struct({
        "reference-id": Schema.optional(Schema.String),
        "transaction-type-id": Schema.optional(Schema.String),
        identifier: Schema.optional(
          Schema.Struct({
            key: Schema.optional(Schema.String),
            value: Schema.optional(Schema.String),
          }),
        ),
      }),
    ).pipe(T.HttpQuery("filter")),
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
    T.Http({ method: "GET", path: "/transactions" }),
  ) as unknown as Schema.Codec<ListAllTransactionsInput>;

// Output Schema
export interface ListAllTransactionsOutput {
  data: ReadonlyArray<{
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
  }>;
  links: { prev: string | null; next: string | null };
}
export const ListAllTransactionsOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
        id: Schema.optional(Schema.String),
        type: Schema.optional(Schema.String),
        attributes: Schema.optional(
          Schema.Struct({
            status: Schema.optional(Schema.String),
            "reference-id": Schema.optional(Schema.NullOr(Schema.String)),
            fields: Schema.optional(
              Schema.Record(Schema.String, Schema.Unknown),
            ),
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
    ),
    links: Schema.Struct({
      prev: Schema.NullOr(Schema.String),
      next: Schema.NullOr(Schema.String),
    }),
  }) as unknown as Schema.Codec<ListAllTransactionsOutput>;

// The operation
/**
 * List all Transactions
 *
 * Returns a list of your organization's transactions. Note that this endpoint aggregates transactions across all transaction type(s). See [Pagination](https://docs.withpersona.com/pagination) for more details about handling the response. Results are returned in reverse chronological order, with the most recently created objects first.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const listAllTransactions = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListAllTransactionsInput,
  outputSchema: ListAllTransactionsOutput,
  errors: [BadRequest, Forbidden, NotFound] as const,
}));
