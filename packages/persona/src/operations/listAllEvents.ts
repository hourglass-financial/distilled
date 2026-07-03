import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden } from "../errors.ts";

// Input Schema
export const ListAllEventsInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
      name: Schema.optional(Schema.String),
      "object-id": Schema.optional(Schema.String),
      id: Schema.optional(Schema.String),
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
}).pipe(T.Http({ method: "GET", path: "/events" }));
export type ListAllEventsInput = typeof ListAllEventsInput.Type;

// Output Schema
export const ListAllEventsOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
      type: Schema.optional(Schema.String),
      id: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          name: Schema.optional(Schema.String),
          payload: Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.Struct({
                  type: Schema.optional(Schema.String),
                  id: Schema.optional(Schema.String),
                  attributes: Schema.optional(
                    Schema.Record(Schema.String, Schema.Unknown),
                  ),
                  relationships: Schema.optional(
                    Schema.Record(Schema.String, Schema.Unknown),
                  ),
                }),
              ),
            }),
          ),
          "created-at": Schema.optional(Schema.String),
          context: Schema.optional(
            Schema.Record(Schema.String, Schema.Unknown),
          ),
        }),
      ),
    }),
  ),
  links: Schema.Struct({
    prev: Schema.NullOr(Schema.String),
    next: Schema.NullOr(Schema.String),
  }),
});
export type ListAllEventsOutput = typeof ListAllEventsOutput.Type;

// The operation
/**
 * List all Events
 *
 * Returns a list of your organization's events. Results are returned in reverse chronological order, with the most recently created objects first.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const listAllEvents = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListAllEventsInput,
  outputSchema: ListAllEventsOutput,
  errors: [BadRequest, Forbidden] as const,
}));
