import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export const RetrieveADocumentVerificationInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    verificationId: Schema.String.pipe(T.PathParam()),
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
    T.Http({ method: "GET", path: "/verification/documents/{verificationId}" }),
  );
export type RetrieveADocumentVerificationInput =
  typeof RetrieveADocumentVerificationInput.Type;

// Output Schema
export const RetrieveADocumentVerificationOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Struct({
      type: Schema.optional(Schema.String),
      id: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          status: Schema.optional(Schema.String),
          "created-at": Schema.optional(Schema.String),
          "created-at-ts": Schema.optional(Schema.Number),
          "submitted-at": Schema.optional(Schema.NullOr(Schema.String)),
          "submitted-at-ts": Schema.optional(Schema.NullOr(Schema.Number)),
          "completed-at": Schema.optional(Schema.NullOr(Schema.String)),
          "completed-at-ts": Schema.optional(Schema.NullOr(Schema.Number)),
          "redacted-at": Schema.optional(Schema.NullOr(Schema.String)),
          "country-code": Schema.optional(Schema.NullOr(Schema.String)),
          tags: Schema.optional(Schema.Array(Schema.String)),
          checks: Schema.optional(
            Schema.Array(
              Schema.Struct({
                name: Schema.optional(Schema.String),
                status: Schema.optional(Schema.String),
                reasons: Schema.optional(
                  Schema.Array(Schema.NullOr(Schema.String)),
                ),
                requirement: Schema.optional(Schema.String),
                metadata: Schema.optional(
                  Schema.Record(Schema.String, Schema.Unknown),
                ),
              }),
            ),
          ),
          fields: Schema.optional(Schema.Unknown),
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
                    type: Schema.optional(Schema.String),
                    id: Schema.optional(Schema.String),
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
                    type: Schema.optional(Schema.String),
                    id: Schema.optional(Schema.String),
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
                    type: Schema.optional(Schema.String),
                    id: Schema.optional(Schema.String),
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
          "verification-template": Schema.optional(
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
          "verification-template-version": Schema.optional(
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
          accounts: Schema.optional(
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
          document: Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.Struct({
                  id: Schema.optional(Schema.String),
                  type: Schema.optional(Schema.String),
                }),
              ),
            }),
          ),
        }),
      ),
    }),
  });
export type RetrieveADocumentVerificationOutput =
  typeof RetrieveADocumentVerificationOutput.Type;

// The operation
/**
 * Retrieve a Document Verification
 *
 * Retrieves the details of a specific document verification
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const retrieveADocumentVerification =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: RetrieveADocumentVerificationInput,
    outputSchema: RetrieveADocumentVerificationOutput,
    errors: [BadRequest, Forbidden, NotFound] as const,
  }));
