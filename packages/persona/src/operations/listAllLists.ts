import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export const ListAllListsInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
      status: Schema.optional(Schema.Literals(["active", "archived"])),
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
}).pipe(T.Http({ method: "GET", path: "/lists" }));
export type ListAllListsInput = typeof ListAllListsInput.Type;

// Output Schema
export const ListAllListsOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Array(Schema.Unknown),
  links: Schema.Struct({
    prev: Schema.NullOr(Schema.String),
    next: Schema.NullOr(Schema.String),
  }),
});
export type ListAllListsOutput = typeof ListAllListsOutput.Type;

// The operation
/**
 * List all Lists
 *
 * Returns a list of your organization's lists. Results are returned in reverse chronological order, with the most recently created objects first.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const listAllLists = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListAllListsInput,
  outputSchema: ListAllListsOutput,
  errors: [BadRequest, Forbidden, NotFound] as const,
}));
