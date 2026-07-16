import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import {
  BadRequest,
  Forbidden,
  Conflict,
  UnprocessableEntity,
} from "../errors.ts";

// Input Schema
export interface ImportGovernmentIdNumberListsInput {
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
    attributes: {
      file: { data?: string; filename?: string };
      "list-id": string;
    };
  };
}
export const ImportGovernmentIdNumberListsInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    include: Schema.optional(Schema.String).pipe(T.HttpQuery("include")),
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
    data: Schema.Struct({
      attributes: Schema.Struct({
        file: Schema.Struct({
          data: Schema.optional(Schema.String),
          filename: Schema.optional(Schema.String),
        }),
        "list-id": Schema.String,
      }),
    }),
  }).pipe(
    T.Http({
      method: "POST",
      path: "/importer/list-item/government-id-numbers",
    }),
  ) as unknown as Schema.Codec<ImportGovernmentIdNumberListsInput>;

// Output Schema
export interface ImportGovernmentIdNumberListsOutput {
  data: {
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
  };
}
export const ImportGovernmentIdNumberListsOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Struct({
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
  }) as unknown as Schema.Codec<ImportGovernmentIdNumberListsOutput>;

// The operation
/**
 * Import Government ID Number Lists
 *
 * Bulk import government ID number List Items by uploading a CSV file.
 * Each row should be the details for a new List Item. The columns we allow are:
 * - id_number
 * - id_class
 * Common values for id_class include `pp` for passport and `dl` for driver license. Please contact us or reach out to [support@withpersona.com](mailto:support@withpersona.com) if you need help getting id_class values.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const importGovernmentIdNumberLists =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: ImportGovernmentIdNumberListsInput,
    outputSchema: ImportGovernmentIdNumberListsOutput,
    errors: [BadRequest, Forbidden, Conflict, UnprocessableEntity] as const,
  }));
