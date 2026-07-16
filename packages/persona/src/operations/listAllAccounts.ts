import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { StructWithAdditionalProperties } from "@distilled.cloud/core/openapi/additional-properties";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface ListAllAccountsInput {
  page?: { after?: string; before?: string; size?: number };
  fields?: Record<string, string>;
  filter?: { "reference-id"?: string };
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
export const ListAllAccountsInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  page: Schema.optional(
    Schema.Struct({
      after: Schema.optional(Schema.String),
      before: Schema.optional(Schema.String),
      size: Schema.optional(Schema.Number),
    }),
  ),
  fields: Schema.optional(Schema.Record(Schema.String, Schema.String)).pipe(
    T.HttpQuery("fields"),
  ),
  filter: Schema.optional(
    Schema.Struct({
      "reference-id": Schema.optional(Schema.String),
    }),
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
  T.Http({ method: "GET", path: "/accounts" }),
) as unknown as Schema.Codec<ListAllAccountsInput>;

// Output Schema
export interface ListAllAccountsOutput {
  data: ReadonlyArray<{
    type?: string;
    id?: string;
    attributes?: {
      "reference-id"?: string | null;
      "account-type-name"?: string;
      "created-at"?: string;
      "updated-at"?: string;
      "redacted-at"?: string | null;
      fields?: {
        name?: {
          type?: string;
          value?: {
            first?: { type?: string; value?: string | null };
            middle?: { type?: string; value?: string | null };
            last?: { type?: string; value?: string | null };
          };
        };
        address?: {
          type?: string;
          value?: {
            street_1?: { type?: string; value?: string | null };
            street_2?: { type?: string; value?: string | null };
            subdivision?: { type?: string; value?: string | null };
            city?: { type?: string; value?: string | null };
            postal_code?: { type?: string; value?: string | null };
            country_code?: { type?: string; value?: string | null };
          };
        };
        identification_numbers?: {
          type?: string;
          value?: ReadonlyArray<{
            type?: string;
            value?: {
              identification_class?: { type?: string; value?: string };
              identification_number?: { type?: string; value?: string };
              issuing_country?: { type?: string; value?: string };
              hashed_identification_number?: {
                type?: string;
                value?: string | null;
              };
            };
          }>;
        };
        birthdate?: { type?: string; value?: string | null };
        phone_number?: { type?: string; value?: string | null };
        email_address?: { type?: string; value?: string | null };
        selfie_photo?: {
          type?: string;
          value?: {
            filename?: string;
            url?: string;
            "byte-size"?: number;
          } | null;
        };
      } & Record<string, unknown>;
      tags?: ReadonlyArray<unknown>;
      "account-status"?: string;
    };
    relationships?: {
      "account-type"?: { data?: { id?: string; type?: string } };
    };
  }>;
  links: { prev: string | null; next: string | null };
}
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
}) as unknown as Schema.Codec<ListAllAccountsOutput>;

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
