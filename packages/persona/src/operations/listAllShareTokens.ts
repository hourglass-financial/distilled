import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden } from "../errors.ts";

// Input Schema
export const ListAllShareTokensInput =
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
        "connection-id": Schema.optional(Schema.String),
        status: Schema.optional(Schema.String),
        direction: Schema.optional(Schema.String),
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
  }).pipe(T.Http({ method: "GET", path: "/connect/share-tokens" }));
export type ListAllShareTokensInput = typeof ListAllShareTokensInput.Type;

// Output Schema
export const ListAllShareTokensOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
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
    ),
    links: Schema.Struct({
      next: Schema.NullOr(Schema.String),
      prev: Schema.NullOr(Schema.String),
    }),
  });
export type ListAllShareTokensOutput = typeof ListAllShareTokensOutput.Type;

// The operation
/**
 * List all Share Tokens
 *
 * Returns a list of your organization's Share Tokens. Results are returned in reverse chronological order, with the most recently created objects first.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const listAllShareTokens = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListAllShareTokensInput,
  outputSchema: ListAllShareTokensOutput,
  errors: [BadRequest, Forbidden] as const,
}));
