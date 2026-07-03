import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export const RetrieveAGraphQueryInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    graphQueryId: Schema.String.pipe(T.PathParam()),
    include: Schema.optional(Schema.String).pipe(T.HttpQuery("include")),
    fields: Schema.optional(Schema.Record(Schema.String, Schema.String)).pipe(
      T.HttpQuery("fields"),
    ),
  }).pipe(T.Http({ method: "GET", path: "/graph-queries/{graphQueryId}" }));
export type RetrieveAGraphQueryInput = typeof RetrieveAGraphQueryInput.Type;

// Output Schema
export const RetrieveAGraphQueryOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Struct({
      type: Schema.optional(Schema.String),
      id: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          status: Schema.optional(Schema.String),
          params: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
          "created-at": Schema.optional(Schema.String),
          "updated-at": Schema.optional(Schema.NullOr(Schema.String)),
          "errored-at": Schema.optional(Schema.NullOr(Schema.String)),
          "completed-at": Schema.optional(Schema.NullOr(Schema.String)),
          "redacted-at": Schema.optional(Schema.NullOr(Schema.String)),
          stats: Schema.optional(Schema.Unknown),
          "explorer-url": Schema.optional(Schema.NullOr(Schema.String)),
          "node-limit-reached": Schema.optional(Schema.NullOr(Schema.Boolean)),
          nodes: Schema.optional(
            Schema.Array(
              Schema.Struct({
                type: Schema.optional(Schema.String),
                value: Schema.optional(Schema.String),
              }),
            ),
          ),
        }),
      ),
      relationships: Schema.optional(
        Schema.Struct({
          accounts: Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.Array(
                  Schema.Struct({
                    id: Schema.optional(Schema.String),
                    type: Schema.optional(Schema.String),
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
export type RetrieveAGraphQueryOutput = typeof RetrieveAGraphQueryOutput.Type;

// The operation
/**
 * Retrieve a Graph Query
 *
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const retrieveAGraphQuery = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: RetrieveAGraphQueryInput,
  outputSchema: RetrieveAGraphQueryOutput,
  errors: [BadRequest, Forbidden, NotFound] as const,
}));
