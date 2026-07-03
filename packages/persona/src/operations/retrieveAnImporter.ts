import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export const RetrieveAnImporterInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    importerId: Schema.String.pipe(T.PathParam()),
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
  }).pipe(T.Http({ method: "GET", path: "/importers/{importerId}" }));
export type RetrieveAnImporterInput = typeof RetrieveAnImporterInput.Type;

// Output Schema
export const RetrieveAnImporterOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Unknown,
    included: Schema.optional(Schema.Array(Schema.Unknown)),
  });
export type RetrieveAnImporterOutput = typeof RetrieveAnImporterOutput.Type;

// The operation
/**
 * Retrieve an Importer
 *
 * Retrieve the details of an existing importer.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 * @param importerId - String ID of the importer to fetch
 */
export const retrieveAnImporter = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: RetrieveAnImporterInput,
  outputSchema: RetrieveAnImporterOutput,
  errors: [BadRequest, Forbidden, NotFound] as const,
}));
