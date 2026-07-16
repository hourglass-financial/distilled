import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface RetrieveAGovernmentIdNfcVerificationInput {
  verificationId: string;
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
export const RetrieveAGovernmentIdNfcVerificationInput =
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
    T.Http({
      method: "GET",
      path: "/verification/government-id-nfcs/{verificationId}",
    }),
  ) as unknown as Schema.Codec<RetrieveAGovernmentIdNfcVerificationInput>;

// Output Schema
export interface RetrieveAGovernmentIdNfcVerificationOutput {
  data: {
    type?: string;
    id?: string;
    attributes?: {
      status?: string;
      "created-at"?: string;
      "created-at-ts"?: number;
      "submitted-at"?: string | null;
      "submitted-at-ts"?: number | null;
      "completed-at"?: string | null;
      "completed-at-ts"?: number | null;
      "redacted-at"?: string | null;
      "country-code"?: string | null;
      tags?: ReadonlyArray<string>;
      checks?: ReadonlyArray<{
        metadata?: Record<string, unknown>;
        name?: string;
        reasons?: ReadonlyArray<string>;
        status?: string;
      }>;
      birthdate?: string | null;
      "expiration-date"?: string | null;
      "id-class"?: string | null;
      "identification-number"?: string | null;
      "name-first"?: string;
      "name-last"?: string;
      "selfie-photo"?: { "byte-size"?: number; url?: string } | null;
      "selfie-photo-url"?: string | null;
      sex?: string | null;
      "address-street-1"?: string | null;
      "address-street-2"?: string | null;
      "address-city"?: string | null;
      "address-subdivision"?: string | null;
      "address-postal-code"?: string | null;
    };
    relationships?: {
      inquiry?: { data?: { id?: string; type?: string } | null };
      template?: { data?: { type?: string; id?: string } | null };
      "inquiry-template-version"?: {
        data?: { type?: string; id?: string } | null;
      };
      "inquiry-template"?: { data?: { type?: string; id?: string } | null };
      transaction?: { data?: { type?: string; id?: string } | null };
      "verification-template"?: {
        data?: { type?: string; id?: string } | null;
      };
      "verification-template-version"?: {
        data?: { type?: string; id?: string } | null;
      };
      accounts?: { data?: ReadonlyArray<{ id?: string; type?: string }> };
      document?: { data?: { id?: string; type?: string } };
    };
  };
}
export const RetrieveAGovernmentIdNfcVerificationOutput =
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
                metadata: Schema.optional(
                  Schema.Record(Schema.String, Schema.Unknown),
                ),
                name: Schema.optional(Schema.String),
                reasons: Schema.optional(Schema.Array(Schema.String)),
                status: Schema.optional(Schema.String),
              }),
            ),
          ),
          birthdate: Schema.optional(Schema.NullOr(Schema.String)),
          "expiration-date": Schema.optional(Schema.NullOr(Schema.String)),
          "id-class": Schema.optional(Schema.NullOr(Schema.String)),
          "identification-number": Schema.optional(
            Schema.NullOr(Schema.String),
          ),
          "name-first": Schema.optional(Schema.String),
          "name-last": Schema.optional(Schema.String),
          "selfie-photo": Schema.optional(
            Schema.NullOr(
              Schema.Struct({
                "byte-size": Schema.optional(Schema.Number),
                url: Schema.optional(Schema.String),
              }),
            ),
          ),
          "selfie-photo-url": Schema.optional(Schema.NullOr(Schema.String)),
          sex: Schema.optional(Schema.NullOr(Schema.String)),
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
  }) as unknown as Schema.Codec<RetrieveAGovernmentIdNfcVerificationOutput>;

// The operation
/**
 * Retrieve a Government ID NFC Verification
 *
 * Retrieve a Government ID NFC verification
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const retrieveAGovernmentIdNfcVerification =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: RetrieveAGovernmentIdNfcVerificationInput,
    outputSchema: RetrieveAGovernmentIdNfcVerificationOutput,
    errors: [BadRequest, Forbidden, NotFound] as const,
  }));
