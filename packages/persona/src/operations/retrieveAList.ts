import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface RetrieveAListInput {
  listId: string;
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
}
export const RetrieveAListInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  listId: Schema.String.pipe(T.PathParam()),
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
  T.Http({ method: "GET", path: "/lists/{listId}" }),
) as unknown as Schema.Codec<RetrieveAListInput>;

// Output Schema
export interface RetrieveAListOutput {
  data:
    | {
        type?: string;
        id?: string;
        attributes?: {
          name?: string;
          status?: string;
          "archived-at"?: string | null;
          "created-at"?: string;
          "updated-at"?: string;
        };
        relationships?: { "list-items"?: { data?: ReadonlyArray<unknown> } };
      }
    | {
        type?: string;
        id?: string;
        attributes?: {
          name?: string;
          status?: string;
          "archived-at"?: string | null;
          "created-at"?: string;
          "updated-at"?: string;
          "allow-fuzzy-name-first"?: boolean;
        };
        relationships?: { "list-items"?: { data?: ReadonlyArray<unknown> } };
      };
}
export const RetrieveAListOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Union([
    Schema.Struct({
      type: Schema.optional(Schema.String),
      id: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          name: Schema.optional(Schema.String),
          status: Schema.optional(Schema.String),
          "archived-at": Schema.optional(Schema.NullOr(Schema.String)),
          "created-at": Schema.optional(Schema.String),
          "updated-at": Schema.optional(Schema.String),
        }),
      ),
      relationships: Schema.optional(
        Schema.Struct({
          "list-items": Schema.optional(
            Schema.Struct({
              data: Schema.optional(Schema.Array(Schema.Unknown)),
            }),
          ),
        }),
      ),
    }),
    Schema.Struct({
      type: Schema.optional(Schema.String),
      id: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          name: Schema.optional(Schema.String),
          status: Schema.optional(Schema.String),
          "archived-at": Schema.optional(Schema.NullOr(Schema.String)),
          "created-at": Schema.optional(Schema.String),
          "updated-at": Schema.optional(Schema.String),
          "allow-fuzzy-name-first": Schema.optional(Schema.Boolean),
        }),
      ),
      relationships: Schema.optional(
        Schema.Struct({
          "list-items": Schema.optional(
            Schema.Struct({
              data: Schema.optional(Schema.Array(Schema.Unknown)),
            }),
          ),
        }),
      ),
    }),
  ]),
}) as unknown as Schema.Codec<RetrieveAListOutput>;

// The operation
/**
 * Retrieve a List
 *
 * Retrieves the details of an existing list.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 * @param listId - ID of the list to retrieve
 */
export const retrieveAList = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: RetrieveAListInput,
  outputSchema: RetrieveAListOutput,
  errors: [BadRequest, Forbidden, NotFound] as const,
}));
