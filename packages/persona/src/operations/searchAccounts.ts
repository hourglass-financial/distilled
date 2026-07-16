import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { StructWithAdditionalProperties } from "@distilled.cloud/core/openapi/additional-properties";
import {
  BadRequest,
  Forbidden,
  NotFound,
  Conflict,
  UnprocessableEntity,
} from "../errors.ts";

// Input Schema
export const SearchAccountsInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  fields: Schema.optional(Schema.Record(Schema.String, Schema.String)).pipe(
    T.HttpQuery("fields"),
  ),
  page: Schema.optional(
    Schema.Struct({
      after: Schema.optional(Schema.String),
      before: Schema.optional(Schema.String),
      size: Schema.optional(Schema.Number),
    }),
  ).pipe(T.HttpQuery("page")),
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
  query: Schema.optional(Schema.Unknown),
  sort: Schema.optional(
    Schema.Struct({
      attribute: Schema.String,
      direction: Schema.String,
    }),
  ),
}).pipe(T.Http({ method: "POST", path: "/accounts/search" }));
export type SearchAccountsInput = typeof SearchAccountsInput.Type;

// Output Schema
export const SearchAccountsOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
      type: Schema.optional(Schema.String),
      id: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          "reference-id": Schema.optional(Schema.NullOr(Schema.String)),
          "account-type-name": Schema.optional(Schema.String),
          "created-at": Schema.optional(Schema.String),
          "updated-at": Schema.optional(Schema.String),
          "redacted-at": Schema.optional(Schema.NullOr(Schema.String)),
          fields: Schema.optional(
            StructWithAdditionalProperties(
              Schema.Struct({
                name: Schema.optional(
                  Schema.Struct({
                    type: Schema.optional(Schema.String),
                    value: Schema.optional(
                      Schema.Struct({
                        first: Schema.optional(
                          Schema.Struct({
                            type: Schema.optional(Schema.String),
                            value: Schema.optional(
                              Schema.NullOr(Schema.String),
                            ),
                          }),
                        ),
                        middle: Schema.optional(
                          Schema.Struct({
                            type: Schema.optional(Schema.String),
                            value: Schema.optional(
                              Schema.NullOr(Schema.String),
                            ),
                          }),
                        ),
                        last: Schema.optional(
                          Schema.Struct({
                            type: Schema.optional(Schema.String),
                            value: Schema.optional(
                              Schema.NullOr(Schema.String),
                            ),
                          }),
                        ),
                      }),
                    ),
                  }),
                ),
                address: Schema.optional(
                  Schema.Struct({
                    type: Schema.optional(Schema.String),
                    value: Schema.optional(
                      Schema.Struct({
                        street_1: Schema.optional(
                          Schema.Struct({
                            type: Schema.optional(Schema.String),
                            value: Schema.optional(
                              Schema.NullOr(Schema.String),
                            ),
                          }),
                        ),
                        street_2: Schema.optional(
                          Schema.Struct({
                            type: Schema.optional(Schema.String),
                            value: Schema.optional(
                              Schema.NullOr(Schema.String),
                            ),
                          }),
                        ),
                        subdivision: Schema.optional(
                          Schema.Struct({
                            type: Schema.optional(Schema.String),
                            value: Schema.optional(
                              Schema.NullOr(Schema.String),
                            ),
                          }),
                        ),
                        city: Schema.optional(
                          Schema.Struct({
                            type: Schema.optional(Schema.String),
                            value: Schema.optional(
                              Schema.NullOr(Schema.String),
                            ),
                          }),
                        ),
                        postal_code: Schema.optional(
                          Schema.Struct({
                            type: Schema.optional(Schema.String),
                            value: Schema.optional(
                              Schema.NullOr(Schema.String),
                            ),
                          }),
                        ),
                        country_code: Schema.optional(
                          Schema.Struct({
                            type: Schema.optional(Schema.String),
                            value: Schema.optional(
                              Schema.NullOr(Schema.String),
                            ),
                          }),
                        ),
                      }),
                    ),
                  }),
                ),
                identification_numbers: Schema.optional(
                  Schema.Struct({
                    type: Schema.optional(Schema.String),
                    value: Schema.optional(
                      Schema.Array(
                        Schema.Struct({
                          type: Schema.optional(Schema.String),
                          value: Schema.optional(
                            Schema.Struct({
                              identification_class: Schema.optional(
                                Schema.Struct({
                                  type: Schema.optional(Schema.String),
                                  value: Schema.optional(Schema.String),
                                }),
                              ),
                              identification_number: Schema.optional(
                                Schema.Struct({
                                  type: Schema.optional(Schema.String),
                                  value: Schema.optional(Schema.String),
                                }),
                              ),
                              issuing_country: Schema.optional(
                                Schema.Struct({
                                  type: Schema.optional(Schema.String),
                                  value: Schema.optional(Schema.String),
                                }),
                              ),
                              hashed_identification_number: Schema.optional(
                                Schema.Struct({
                                  type: Schema.optional(Schema.String),
                                  value: Schema.optional(
                                    Schema.NullOr(Schema.String),
                                  ),
                                }),
                              ),
                            }),
                          ),
                        }),
                      ),
                    ),
                  }),
                ),
                birthdate: Schema.optional(
                  Schema.Struct({
                    type: Schema.optional(Schema.String),
                    value: Schema.optional(Schema.NullOr(Schema.String)),
                  }),
                ),
                phone_number: Schema.optional(
                  Schema.Struct({
                    type: Schema.optional(Schema.String),
                    value: Schema.optional(Schema.NullOr(Schema.String)),
                  }),
                ),
                email_address: Schema.optional(
                  Schema.Struct({
                    type: Schema.optional(Schema.String),
                    value: Schema.optional(Schema.NullOr(Schema.String)),
                  }),
                ),
                selfie_photo: Schema.optional(
                  Schema.Struct({
                    type: Schema.optional(Schema.String),
                    value: Schema.optional(
                      Schema.NullOr(
                        Schema.Struct({
                          filename: Schema.optional(Schema.String),
                          url: Schema.optional(Schema.String),
                          "byte-size": Schema.optional(Schema.Number),
                        }),
                      ),
                    ),
                  }),
                ),
              }),
              Schema.Unknown,
            ),
          ),
          tags: Schema.optional(Schema.Array(Schema.Unknown)),
          "account-status": Schema.optional(Schema.String),
        }),
      ),
      relationships: Schema.optional(
        Schema.Struct({
          "account-type": Schema.optional(
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
  ),
  links: Schema.Struct({
    prev: Schema.NullOr(Schema.String),
    next: Schema.NullOr(Schema.String),
  }),
});
export type SearchAccountsOutput = typeof SearchAccountsOutput.Type;

// The operation
/**
 * Search Accounts
 *
 * Search for accounts using a flexible query language.
 * ## Search vs. List Endpoints
 * The Search and List endpoints serve different purposes and have distinct performance characteristics.
 * Use the **Search** endpoint (`POST /accounts/search`) when you need to perform complex queries with boolean logic (AND/OR/NOT), filter by custom fields or identifiers, or apply multiple conditions simultaneously. Search is optimized for flexible querying and is faster than paginating through all resources when looking for specific records.
 * Use the **List** endpoint (`GET /accounts`) for simple listing with basic filters like reference ID.
 * ## Data Freshness
 * Do not use search for read-after-write flows because the data will not be immediately available to search.
 * Under normal operating conditions, data is searchable within approximately 1 minute of creation or modification.
 * Propagation of new or updated data could be delayed during an outage.
 * For workflows that require immediate data availability after creating or updating an account, use the List Accounts endpoint instead.
 * ### Searchable Attributes
 * The following attributes can be used in query predicates:
 * **Note:** Custom fields (`fields.*`) must be configured as searchable on the Account Type to be queryable.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const searchAccounts = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: SearchAccountsInput,
  outputSchema: SearchAccountsOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
