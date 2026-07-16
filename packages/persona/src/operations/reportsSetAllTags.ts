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
export interface ReportsSetAllTagsInput {
  reportId: string;
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
  meta?: {
    "tag-name"?: ReadonlyArray<string>;
    "tag-id"?: ReadonlyArray<string>;
  };
}
export const ReportsSetAllTagsInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
  {
    reportId: Schema.String.pipe(T.PathParam()),
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
    meta: Schema.optional(
      Schema.Struct({
        "tag-name": Schema.optional(Schema.Array(Schema.String)),
        "tag-id": Schema.optional(Schema.Array(Schema.String)),
      }),
    ),
  },
).pipe(
  T.Http({ method: "POST", path: "/reports/{reportId}/set-tags" }),
) as unknown as Schema.Codec<ReportsSetAllTagsInput>;

// Output Schema
export interface ReportsSetAllTagsOutput {
  data: unknown;
  included?: ReadonlyArray<unknown>;
}
export const ReportsSetAllTagsOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Unknown,
    included: Schema.optional(Schema.Array(Schema.Unknown)),
  }) as unknown as Schema.Codec<ReportsSetAllTagsOutput>;

// The operation
/**
 * Set tags on a Report
 *
 * Sets all tags on a Report. Any tags that are not provided in the request will be removed.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const reportsSetAllTags = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ReportsSetAllTagsInput,
  outputSchema: ReportsSetAllTagsOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
