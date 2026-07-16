import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { StructWithAdditionalProperties } from "@distilled.cloud/core/openapi/additional-properties";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface RetrieveADocumentInput {
  documentId: string;
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
export const RetrieveADocumentInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
  {
    documentId: Schema.String.pipe(T.PathParam()),
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
  },
).pipe(
  T.Http({ method: "GET", path: "/documents/{documentId}" }),
) as unknown as Schema.Codec<RetrieveADocumentInput>;

// Output Schema
export interface RetrieveADocumentOutput {
  data:
    | {
        id?: string;
        type?: string;
        attributes?: {
          status?: string;
          "created-at"?: string;
          "processed-at"?: string | null;
          "processed-at-ts"?: number | null;
          kind?: string;
          files?: ReadonlyArray<{
            filename?: string;
            url?: string;
            "byte-size"?: number;
          } | null>;
          "files-normalized"?: ReadonlyArray<{
            filename?: string;
            url?: string;
            "byte-size"?: number;
          } | null>;
          "extraction-responses"?: ReadonlyArray<{
            "extraction-type"?: string;
            "field-name"?: string;
            "structured-results"?: ReadonlyArray<Record<string, unknown>>;
            results?: ReadonlyArray<{
              value?: string;
              page?: number;
              "match-level"?: string;
              metadata?: unknown | null;
            }>;
          }> | null;
          "document-type"?: string | null;
          fields?: Record<string, unknown>;
        };
        relationships?: {
          inquiry?: { data?: { id?: string; type?: string } | null };
          template?: { data?: { id?: string; type?: string } | null };
          "inquiry-template-version"?: {
            data?: { id?: string; type?: string } | null;
          };
          "inquiry-template"?: { data?: { id?: string; type?: string } | null };
          transaction?: { data?: { type?: string; id?: string } | null };
          "document-files"?: {
            data?: ReadonlyArray<{ id?: string; type?: string }>;
          };
        };
      }
    | {
        id?: string;
        type?: string;
        attributes?: {
          status?: string;
          "created-at"?: string;
          "processed-at"?: string | null;
          "processed-at-ts"?: number | null;
          "front-photo"?: {
            filename?: string;
            url?: string;
            "byte-size"?: number;
          } | null;
          "back-photo"?: {
            filename?: string;
            url?: string;
            "byte-size"?: number;
          } | null;
          "selfie-photo"?: {
            filename?: string;
            url?: string;
            "byte-size"?: number;
          } | null;
          "id-class"?: string | null;
          "name-first"?: string | null;
          "name-middle"?: string | null;
          "name-last"?: string | null;
          "name-suffix"?: string | null;
          "native-name-first"?: string | null;
          "native-name-middle"?: string | null;
          "native-name-last"?: string | null;
          "native-name-title"?: string | null;
          birthdate?: string | null;
          "issuing-authority"?: string | null;
          "issuing-subdivision"?: string | null;
          nationality?: string | null;
          "document-number"?: string | null;
          "visa-status"?: string | null;
          "issue-date"?: string | null;
          "expiration-date"?: string | null;
          designations?: ReadonlyArray<string> | null;
          birthplace?: string | null;
          height?: string | null;
          sex?: string | null;
          endorsements?: string | null;
          restrictions?: string | null;
          "vehicle-class"?: string | null;
          "identification-number"?: string | null;
          "address-street-1"?: string | null;
          "address-street-2"?: string | null;
          "address-city"?: string | null;
          "address-subdivision"?: string | null;
          "address-postal-code"?: string | null;
        };
        relationships?: {
          inquiry?: { data?: { id?: string; type?: string } | null };
          template?: { data?: { id?: string; type?: string } | null };
          "inquiry-template-version"?: {
            data?: { id?: string; type?: string } | null;
          };
          "inquiry-template"?: { data?: { id?: string; type?: string } | null };
          transaction?: { data?: { type?: string; id?: string } | null };
          "document-files"?: {
            data?: ReadonlyArray<{ id?: string; type?: string }>;
          };
        };
      }
    | {
        id?: string;
        type?: string;
        attributes?: {
          status?: string;
          "created-at"?: string;
          "processed-at"?: string | null;
          "processed-at-ts"?: number | null;
        };
        relationships?: {
          inquiry?: { data?: { id?: string; type?: string } | null };
          template?: { data?: { id?: string; type?: string } | null };
          "inquiry-template-version"?: {
            data?: { id?: string; type?: string } | null;
          };
          "inquiry-template"?: { data?: { id?: string; type?: string } | null };
          transaction?: { data?: { type?: string; id?: string } | null };
          "document-files"?: {
            data?: ReadonlyArray<{ id?: string; type?: string }>;
          };
        };
      };
  included?: ReadonlyArray<
    | ({ type: "inquiry"; id: string } & Record<string, unknown>)
    | ({ type?: "inquiry-template"; id?: string } & Record<string, unknown>)
    | ({ type?: "inquiry-template-version"; id?: string } & Record<
        string,
        unknown
      >)
    | ({ type?: "template"; id?: string } & Record<string, unknown>)
    | ({ type?: "transaction"; id?: string } & Record<string, unknown>)
    | {
        type?: "document-file";
        id?: string;
        attributes?: {
          name?: string | null;
          "capture-method"?: string;
          originals?: ReadonlyArray<{
            filename?: string;
            url?: string;
            "byte-size"?: number;
          } | null>;
        };
      }
  >;
}
export const RetrieveADocumentOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Unknown,
    included: Schema.optional(
      Schema.Array(
        Schema.Union([
          StructWithAdditionalProperties(
            Schema.Struct({
              type: Schema.Literals(["inquiry"]),
              id: Schema.String,
            }),
            Schema.Unknown,
          ),
          StructWithAdditionalProperties(
            Schema.Struct({
              type: Schema.optional(Schema.Literals(["inquiry-template"])),
              id: Schema.optional(Schema.String),
            }),
            Schema.Unknown,
          ),
          StructWithAdditionalProperties(
            Schema.Struct({
              type: Schema.optional(
                Schema.Literals(["inquiry-template-version"]),
              ),
              id: Schema.optional(Schema.String),
            }),
            Schema.Unknown,
          ),
          StructWithAdditionalProperties(
            Schema.Struct({
              type: Schema.optional(Schema.Literals(["template"])),
              id: Schema.optional(Schema.String),
            }),
            Schema.Unknown,
          ),
          StructWithAdditionalProperties(
            Schema.Struct({
              type: Schema.optional(Schema.Literals(["transaction"])),
              id: Schema.optional(Schema.String),
            }),
            Schema.Unknown,
          ),
          Schema.Struct({
            type: Schema.optional(Schema.Literals(["document-file"])),
            id: Schema.optional(Schema.String),
            attributes: Schema.optional(
              Schema.Struct({
                name: Schema.optional(Schema.NullOr(Schema.String)),
                "capture-method": Schema.optional(Schema.String),
                originals: Schema.optional(
                  Schema.Array(
                    Schema.NullOr(
                      Schema.Struct({
                        filename: Schema.optional(Schema.String),
                        url: Schema.optional(Schema.String),
                        "byte-size": Schema.optional(Schema.Number),
                      }),
                    ),
                  ),
                ),
              }),
            ),
          }),
        ]),
      ),
    ),
  }) as unknown as Schema.Codec<RetrieveADocumentOutput>;

// The operation
/**
 * Retrieve a Document
 *
 * Retrieves the details of a Document.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const retrieveADocument = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: RetrieveADocumentInput,
  outputSchema: RetrieveADocumentOutput,
  errors: [BadRequest, Forbidden, NotFound] as const,
}));
