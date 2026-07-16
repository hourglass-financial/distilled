import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { StructWithAdditionalProperties } from "@distilled.cloud/core/openapi/additional-properties";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export const ListAllAccountsInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  page: Schema.optional(
    Schema.Struct({
      after: Schema.optional(Schema.String),
      before: Schema.optional(Schema.String),
      size: Schema.optional(Schema.Number),
    }),
  ).pipe(T.HttpQuery("page")),
  fields: Schema.optional(Schema.Record(Schema.String, Schema.String)).pipe(
    T.HttpQuery("fields"),
  ),
  filter: Schema.optional(
    Schema.Struct({
      "reference-id": Schema.optional(Schema.String),
    }),
  ).pipe(T.HttpQuery("filter")),
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
}).pipe(T.Http({ method: "GET", path: "/accounts" }));
export type ListAllAccountsInput = typeof ListAllAccountsInput.Type;

// Output Schema
export const ListAllAccountsOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
export type ListAllAccountsOutput = typeof ListAllAccountsOutput.Type;

// The operation
/**
 * List all Accounts
 *
 * Returns a list of your organization's account(s). Results are returned in reverse chronological order, with the most recently created objects first.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const listAllAccounts = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListAllAccountsInput,
  outputSchema: ListAllAccountsOutput,
  errors: [BadRequest, Forbidden, NotFound] as const,
}));
