import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface RetrieveAGovernmentIdDocumentInput {
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
export const RetrieveAGovernmentIdDocumentInput =
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
    T.Http({ method: "GET", path: "/document/government-ids/{documentId}" }),
  ) as unknown as Schema.Codec<RetrieveAGovernmentIdDocumentInput>;

// Output Schema
export interface RetrieveAGovernmentIdDocumentOutput {
  data: {
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
  };
  included?: ReadonlyArray<unknown>;
}
export const RetrieveAGovernmentIdDocumentOutput =
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
          "front-photo": Schema.optional(
            Schema.NullOr(
              Schema.Struct({
                filename: Schema.optional(Schema.String),
                url: Schema.optional(Schema.String),
                "byte-size": Schema.optional(Schema.Number),
              }),
            ),
          ),
          "back-photo": Schema.optional(
            Schema.NullOr(
              Schema.Struct({
                filename: Schema.optional(Schema.String),
                url: Schema.optional(Schema.String),
                "byte-size": Schema.optional(Schema.Number),
              }),
            ),
          ),
          "selfie-photo": Schema.optional(
            Schema.NullOr(
              Schema.Struct({
                filename: Schema.optional(Schema.String),
                url: Schema.optional(Schema.String),
                "byte-size": Schema.optional(Schema.Number),
              }),
            ),
          ),
          "id-class": Schema.optional(Schema.NullOr(Schema.String)),
          "name-first": Schema.optional(Schema.NullOr(Schema.String)),
          "name-middle": Schema.optional(Schema.NullOr(Schema.String)),
          "name-last": Schema.optional(Schema.NullOr(Schema.String)),
          "name-suffix": Schema.optional(Schema.NullOr(Schema.String)),
          "native-name-first": Schema.optional(Schema.NullOr(Schema.String)),
          "native-name-middle": Schema.optional(Schema.NullOr(Schema.String)),
          "native-name-last": Schema.optional(Schema.NullOr(Schema.String)),
          "native-name-title": Schema.optional(Schema.NullOr(Schema.String)),
          birthdate: Schema.optional(Schema.NullOr(Schema.String)),
          "issuing-authority": Schema.optional(Schema.NullOr(Schema.String)),
          "issuing-subdivision": Schema.optional(Schema.NullOr(Schema.String)),
          nationality: Schema.optional(Schema.NullOr(Schema.String)),
          "document-number": Schema.optional(Schema.NullOr(Schema.String)),
          "visa-status": Schema.optional(Schema.NullOr(Schema.String)),
          "issue-date": Schema.optional(Schema.NullOr(Schema.String)),
          "expiration-date": Schema.optional(Schema.NullOr(Schema.String)),
          designations: Schema.optional(
            Schema.NullOr(Schema.Array(Schema.String)),
          ),
          birthplace: Schema.optional(Schema.NullOr(Schema.String)),
          height: Schema.optional(Schema.NullOr(Schema.String)),
          sex: Schema.optional(Schema.NullOr(Schema.String)),
          endorsements: Schema.optional(Schema.NullOr(Schema.String)),
          restrictions: Schema.optional(Schema.NullOr(Schema.String)),
          "vehicle-class": Schema.optional(Schema.NullOr(Schema.String)),
          "identification-number": Schema.optional(
            Schema.NullOr(Schema.String),
          ),
          "address-street-1": Schema.optional(Schema.NullOr(Schema.String)),
          "address-street-2": Schema.optional(Schema.NullOr(Schema.String)),
          "address-city": Schema.optional(Schema.NullOr(Schema.String)),
          "address-subdivision": Schema.optional(Schema.NullOr(Schema.String)),
          "address-postal-code": Schema.optional(Schema.NullOr(Schema.String)),
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
  }) as unknown as Schema.Codec<RetrieveAGovernmentIdDocumentOutput>;

// The operation
/**
 * Retrieve a Government Id Document
 *
 * Retrieves the details of a government-id document that has been previously created.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const retrieveAGovernmentIdDocument =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: RetrieveAGovernmentIdDocumentInput,
    outputSchema: RetrieveAGovernmentIdDocumentOutput,
    errors: [BadRequest, Forbidden, NotFound] as const,
  }));
