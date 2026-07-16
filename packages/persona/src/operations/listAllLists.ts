import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface ListAllListsInput {
  page?: { after?: string; before?: string; size?: number };
  fields?: Record<string, string>;
  filter?: { status?: "active" | "archived" };
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
export const ListAllListsInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  page: Schema.optional(
    Schema.Struct({
      after: Schema.optional(Schema.String),
      before: Schema.optional(Schema.String),
      size: Schema.optional(Schema.Number),
    }),
  ).pipe(T.HttpQuery("page", { style: "deepObject", explode: true })),
  fields: Schema.optional(Schema.Record(Schema.String, Schema.String)).pipe(
    T.HttpQuery("fields", { style: "deepObject", explode: true }),
  ),
  filter: Schema.optional(
    Schema.Struct({
      status: Schema.optional(Schema.Literals(["active", "archived"])),
    }),
  ).pipe(T.HttpQuery("filter", { style: "deepObject", explode: true })),
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
  T.Http({ method: "GET", path: "/lists" }),
) as unknown as Schema.Codec<ListAllListsInput>;

// Output Schema
export interface ListAllListsOutput {
  data: ReadonlyArray<
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
      }
  >;
  links: { prev: string | null; next: string | null };
}
export const ListAllListsOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Array(
    Schema.Union([
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
  ),
  links: Schema.Struct({
    prev: Schema.NullOr(Schema.String),
    next: Schema.NullOr(Schema.String),
  }),
}) as unknown as Schema.Codec<ListAllListsOutput>;

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
