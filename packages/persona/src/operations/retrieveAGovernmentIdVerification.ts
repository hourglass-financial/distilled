import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export const RetrieveAGovernmentIdVerificationInput =
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
      path: "/verification/government-ids/{verificationId}",
    }),
  );
export type RetrieveAGovernmentIdVerificationInput =
  typeof RetrieveAGovernmentIdVerificationInput.Type;

// Output Schema
export const RetrieveAGovernmentIdVerificationOutput =
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
          "entity-confidence-reasons": Schema.optional(
            Schema.Array(Schema.String),
          ),
          "entity-confidence-score": Schema.optional(
            Schema.NullOr(Schema.Number),
          ),
          "front-photo-url": Schema.optional(Schema.NullOr(Schema.String)),
          "back-photo-url": Schema.optional(Schema.NullOr(Schema.String)),
          "photo-urls": Schema.optional(
            Schema.NullOr(
              Schema.Array(
                Schema.Struct({
                  "byte-size": Schema.optional(Schema.Number),
                  "normalized-url": Schema.optional(Schema.String),
                  "original-urls": Schema.optional(Schema.Array(Schema.String)),
                  page: Schema.optional(Schema.String),
                  url: Schema.optional(Schema.String),
                }),
              ),
            ),
          ),
          "selfie-photo": Schema.optional(
            Schema.NullOr(
              Schema.Struct({
                "byte-size": Schema.optional(Schema.Number),
                url: Schema.optional(Schema.String),
              }),
            ),
          ),
          "selfie-photo-url": Schema.optional(Schema.NullOr(Schema.String)),
          "video-url": Schema.optional(Schema.NullOr(Schema.String)),
          "id-class": Schema.optional(Schema.NullOr(Schema.String)),
          "capture-method": Schema.optional(Schema.NullOr(Schema.String)),
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
            Schema.NullOr(Schema.Array(Schema.Unknown)),
          ),
          birthplace: Schema.optional(Schema.NullOr(Schema.String)),
          endorsements: Schema.optional(Schema.NullOr(Schema.String)),
          height: Schema.optional(Schema.NullOr(Schema.String)),
          sex: Schema.optional(Schema.NullOr(Schema.String)),
          restrictions: Schema.optional(Schema.NullOr(Schema.String)),
          "vehicle-class": Schema.optional(Schema.NullOr(Schema.String)),
          "identification-number": Schema.optional(
            Schema.NullOr(Schema.String),
          ),
          "from-reusable-persona": Schema.optional(Schema.Boolean),
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
  });
export type RetrieveAGovernmentIdVerificationOutput =
  typeof RetrieveAGovernmentIdVerificationOutput.Type;

// The operation
/**
 * Retrieve a Government ID Verification
 *
 * Retrieve a government ID verification
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const retrieveAGovernmentIdVerification =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: RetrieveAGovernmentIdVerificationInput,
    outputSchema: RetrieveAGovernmentIdVerificationOutput,
    errors: [BadRequest, Forbidden, NotFound] as const,
  }));
