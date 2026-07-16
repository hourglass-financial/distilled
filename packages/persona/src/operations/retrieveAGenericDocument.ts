import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface RetrieveAGenericDocumentInput {
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
export const RetrieveAGenericDocumentInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
  }).pipe(
    T.Http({ method: "GET", path: "/document/generics/{documentId}" }),
  ) as unknown as Schema.Codec<RetrieveAGenericDocumentInput>;

// Output Schema
export interface RetrieveAGenericDocumentOutput {
  data: {
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
  };
  included?: ReadonlyArray<unknown>;
}
export const RetrieveAGenericDocumentOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Struct({
      id: Schema.optional(Schema.String),
      type: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          status: Schema.optional(Schema.String),
          "created-at": Schema.optional(Schema.String),
          "processed-at": Schema.optional(Schema.NullOr(Schema.String)),
          "processed-at-ts": Schema.optional(Schema.NullOr(Schema.Number)),
          kind: Schema.optional(Schema.String),
          files: Schema.optional(
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
          "files-normalized": Schema.optional(
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
          "extraction-responses": Schema.optional(
            Schema.NullOr(
              Schema.Array(
                Schema.Struct({
                  "extraction-type": Schema.optional(Schema.String),
                  "field-name": Schema.optional(Schema.String),
                  "structured-results": Schema.optional(
                    Schema.Array(Schema.Record(Schema.String, Schema.Unknown)),
                  ),
                  results: Schema.optional(
                    Schema.Array(
                      Schema.Struct({
                        value: Schema.optional(Schema.String),
                        page: Schema.optional(Schema.Number),
                        "match-level": Schema.optional(Schema.String),
                        metadata: Schema.optional(
                          Schema.NullOr(Schema.Unknown),
                        ),
                      }),
                    ),
                  ),
                }),
              ),
            ),
          ),
          "document-type": Schema.optional(Schema.NullOr(Schema.String)),
          fields: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
        }),
      ),
      relationships: Schema.optional(
        Schema.Struct({
          inquiry: Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.NullOr(
                  Schema.Struct({
                    id: Schema.optional(Schema.String),
                    type: Schema.optional(Schema.String),
                  }),
                ),
              ),
            }),
          ),
          template: Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.NullOr(
                  Schema.Struct({
                    id: Schema.optional(Schema.String),
                    type: Schema.optional(Schema.String),
                  }),
                ),
              ),
            }),
          ),
          "inquiry-template-version": Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.NullOr(
                  Schema.Struct({
                    id: Schema.optional(Schema.String),
                    type: Schema.optional(Schema.String),
                  }),
                ),
              ),
            }),
          ),
          "inquiry-template": Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.NullOr(
                  Schema.Struct({
                    id: Schema.optional(Schema.String),
                    type: Schema.optional(Schema.String),
                  }),
                ),
              ),
            }),
          ),
          transaction: Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.NullOr(
                  Schema.Struct({
                    type: Schema.optional(Schema.String),
                    id: Schema.optional(Schema.String),
                  }),
                ),
              ),
            }),
          ),
          "document-files": Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.Array(
                  Schema.Struct({
                    id: Schema.optional(Schema.String),
                    type: Schema.optional(Schema.String),
                  }),
                ),
              ),
            }),
          ),
        }),
      ),
    }),
    included: Schema.optional(Schema.Array(Schema.Unknown)),
  }) as unknown as Schema.Codec<RetrieveAGenericDocumentOutput>;

// The operation
/**
 * Retrieve a Generic Document
 *
 * Retrieves the details of a generic document that has been previously created.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const retrieveAGenericDocument = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: RetrieveAGenericDocumentInput,
    outputSchema: RetrieveAGenericDocumentOutput,
    errors: [BadRequest, Forbidden, NotFound] as const,
  }),
);
