import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import {
  BadRequest,
  Forbidden,
  NotFound,
  RequestTimeout,
  Conflict,
  UnprocessableEntity,
} from "../errors.ts";

// Input Schema
export const CreateAReportInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
  data: Schema.optional(Schema.Unknown),
  meta: Schema.optional(
    Schema.Struct({
      "auto-create-account": Schema.optional(Schema.Boolean),
      "auto-create-account-type-id": Schema.optional(Schema.String),
      "auto-create-account-reference-id": Schema.optional(Schema.String),
      "processing-mode": Schema.optional(Schema.String),
      "request-flags": Schema.optional(Schema.Array(Schema.String)),
    }),
  ),
}).pipe(T.Http({ method: "POST", path: "/reports" }));
export type CreateAReportInput = typeof CreateAReportInput.Type;

// Output Schema
export const CreateAReportOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Unknown,
  included: Schema.optional(Schema.Array(Schema.Unknown)),
});
export type CreateAReportOutput = typeof CreateAReportOutput.Type;

// The operation
/**
 * Create a Report
 *
 * Creates a new Report of any type.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const createAReport = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateAReportInput,
  outputSchema: CreateAReportOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    RequestTimeout,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
