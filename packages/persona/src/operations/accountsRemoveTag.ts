import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import {
  BadRequest,
  Forbidden,
  NotFound,
  Conflict,
  UnprocessableEntity,
} from "../errors.ts";

// Input Schema
export const AccountsRemoveTagInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
  {
    accountId: Schema.String.pipe(T.PathParam()),
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
    meta: Schema.Struct({
      "tag-name": Schema.optional(Schema.String),
      "tag-id": Schema.optional(Schema.String),
    }),
  },
).pipe(T.Http({ method: "POST", path: "/accounts/{accountId}/remove-tag" }));
export type AccountsRemoveTagInput = typeof AccountsRemoveTagInput.Type;

// Output Schema
export const AccountsRemoveTagOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Struct({
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
            Schema.Struct({
              name: Schema.optional(
                Schema.Struct({
                  type: Schema.optional(Schema.String),
                  value: Schema.optional(
                    Schema.Struct({
                      first: Schema.optional(
                        Schema.Struct({
                          type: Schema.optional(Schema.String),
                          value: Schema.optional(Schema.NullOr(Schema.String)),
                        }),
                      ),
                      middle: Schema.optional(
                        Schema.Struct({
                          type: Schema.optional(Schema.String),
                          value: Schema.optional(Schema.NullOr(Schema.String)),
                        }),
                      ),
                      last: Schema.optional(
                        Schema.Struct({
                          type: Schema.optional(Schema.String),
                          value: Schema.optional(Schema.NullOr(Schema.String)),
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
                          value: Schema.optional(Schema.NullOr(Schema.String)),
                        }),
                      ),
                      street_2: Schema.optional(
                        Schema.Struct({
                          type: Schema.optional(Schema.String),
                          value: Schema.optional(Schema.NullOr(Schema.String)),
                        }),
                      ),
                      subdivision: Schema.optional(
                        Schema.Struct({
                          type: Schema.optional(Schema.String),
                          value: Schema.optional(Schema.NullOr(Schema.String)),
                        }),
                      ),
                      city: Schema.optional(
                        Schema.Struct({
                          type: Schema.optional(Schema.String),
                          value: Schema.optional(Schema.NullOr(Schema.String)),
                        }),
                      ),
                      postal_code: Schema.optional(
                        Schema.Struct({
                          type: Schema.optional(Schema.String),
                          value: Schema.optional(Schema.NullOr(Schema.String)),
                        }),
                      ),
                      country_code: Schema.optional(
                        Schema.Struct({
                          type: Schema.optional(Schema.String),
                          value: Schema.optional(Schema.NullOr(Schema.String)),
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
    included: Schema.optional(Schema.Array(Schema.Unknown)),
  });
export type AccountsRemoveTagOutput = typeof AccountsRemoveTagOutput.Type;

// The operation
/**
 * Remove tag from an Account
 *
 * Removes an existing tag from an Account
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const accountsRemoveTag = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: AccountsRemoveTagInput,
  outputSchema: AccountsRemoveTagOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
