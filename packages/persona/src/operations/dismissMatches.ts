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
export interface DismissMatchesInput {
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
  data: {
    attributes?: {
      "dismiss-type"?: string;
      "entity-id"?: string;
      reason?: string;
    };
  };
}
export const DismissMatchesInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
  data: Schema.Struct({
    attributes: Schema.optional(
      Schema.Struct({
        "dismiss-type": Schema.optional(Schema.String),
        "entity-id": Schema.optional(Schema.String),
        reason: Schema.optional(Schema.String),
      }),
    ),
  }),
}).pipe(
  T.Http({ method: "POST", path: "/reports/{reportId}/dismiss" }),
) as unknown as Schema.Codec<DismissMatchesInput>;

// Output Schema
export interface DismissMatchesOutput {
  data: unknown;
  included?: ReadonlyArray<unknown>;
}
export const DismissMatchesOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Unknown,
  included: Schema.optional(Schema.Array(Schema.Unknown)),
}) as unknown as Schema.Codec<DismissMatchesOutput>;

// The operation
/**
 * Report Action: Dismiss Matches
 *
 * Dismisses active matches for supported report types
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const dismissMatches = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: DismissMatchesInput,
  outputSchema: DismissMatchesOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
