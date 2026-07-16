import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden } from "../errors.ts";

// Input Schema
export interface ListAllImportersInput {
  page?: { after?: string; before?: string; size?: number };
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
export const ListAllImportersInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
  T.Http({ method: "GET", path: "/importers" }),
) as unknown as Schema.Codec<ListAllImportersInput>;

// Output Schema
export interface ListAllImportersOutput {
  data: ReadonlyArray<{
    id?: string;
    type?: string;
    attributes?: {
      "completed-at"?: string | null;
      "created-at"?: string;
      "duplicate-count"?: number;
      "error-count"?: number;
      status?: string;
      "successful-count"?: number;
    };
  }>;
  links: { prev: string | null; next: string | null };
}
export const ListAllImportersOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
  {
    data: Schema.Array(
      Schema.Struct({
        id: Schema.optional(Schema.String),
        type: Schema.optional(Schema.String),
        attributes: Schema.optional(
          Schema.Struct({
            "completed-at": Schema.optional(Schema.NullOr(Schema.String)),
            "created-at": Schema.optional(Schema.String),
            "duplicate-count": Schema.optional(Schema.Number),
            "error-count": Schema.optional(Schema.Number),
            status: Schema.optional(Schema.String),
            "successful-count": Schema.optional(Schema.Number),
          }),
        ),
      }),
    ),
    links: Schema.Struct({
      prev: Schema.NullOr(Schema.String),
      next: Schema.NullOr(Schema.String),
    }),
  },
) as unknown as Schema.Codec<ListAllImportersOutput>;

// The operation
/**
 * List all Importers
 *
 * Returns a list of your organization's importers. Results are returned in reverse chronological order, with the most recently created objects first.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const listAllImporters = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListAllImportersInput,
  outputSchema: ListAllImportersOutput,
  errors: [BadRequest, Forbidden] as const,
}));
