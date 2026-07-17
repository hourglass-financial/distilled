import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { StructWithAdditionalProperties } from "@distilled.cloud/core/openapi/additional-properties";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import {
  BadRequest,
  Forbidden,
  NotFound,
  Conflict,
  UnprocessableEntity,
} from "../errors.ts";

// Input Schema
export interface AccountsListAllRelationsInput {
  accountId: string;
  include?: string;
  fields?: Record<string, string>;
  filter: {
    key: string;
    "created-at-start"?: string;
    "created-at-end"?: string;
  };
  page?: { after?: string; before?: string; size?: number };
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
export const AccountsListAllRelationsInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    accountId: Schema.String.pipe(T.PathParam()),
    include: Schema.optional(Schema.String).pipe(T.HttpQuery("include")),
    fields: Schema.optional(Schema.Record(Schema.String, Schema.String)).pipe(
      T.HttpQuery("fields", { style: "deepObject", explode: true }),
    ),
    filter: Schema.Struct({
      key: Schema.String,
      "created-at-start": Schema.optional(Schema.String),
      "created-at-end": Schema.optional(Schema.String),
    }).pipe(T.HttpQuery("filter", { style: "deepObject", explode: true })),
    page: Schema.optional(
      Schema.Struct({
        after: Schema.optional(Schema.String),
        before: Schema.optional(Schema.String),
        size: Schema.optional(Schema.Number),
      }),
    ).pipe(T.HttpQuery("page", { style: "deepObject", explode: true })),
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
    T.Http({ method: "GET", path: "/accounts/{accountId}/relations" }),
  ) as unknown as GeneratedStructCodec<AccountsListAllRelationsInput>;

// Output Schema
export interface AccountsListAllRelationsOutput {
  data: ReadonlyArray<
    | {
        type: "account";
        id: string;
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
              type?: "file";
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
          "account-type"?: { data?: { id?: string; type?: "account-type" } };
        };
      }
    | {
        id: string;
        type: "transaction";
        attributes?: {
          status?: string;
          "reference-id"?: string | null;
          fields?: Record<string, unknown>;
          tags?: ReadonlyArray<string>;
          "created-at"?: string;
          "updated-at"?: string | null;
        };
        relationships?: {
          reviewer?: { data?: { type?: string; id?: string } | null };
          "transaction-label"?: {
            data?: { type?: "transaction-label"; id?: string } | null;
          };
          "transaction-type"?: {
            data?: { type?: "transaction-type"; id?: string };
          };
          "related-objects"?: {
            data?: ReadonlyArray<{ type?: string; id?: string }>;
          };
        };
      }
  >;
  links: { prev: string | null; next: string | null };
}
export const AccountsListAllRelationsOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Union([
        Schema.Struct({
          type: Schema.Literals(["account"]),
          id: Schema.String,
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
                        type: Schema.optional(Schema.Literals(["file"])),
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
                      type: Schema.optional(Schema.Literals(["account-type"])),
                    }),
                  ),
                }),
              ),
            }),
          ),
        }),
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literals(["transaction"]),
          attributes: Schema.optional(
            Schema.Struct({
              status: Schema.optional(Schema.String),
              "reference-id": Schema.optional(Schema.NullOr(Schema.String)),
              fields: Schema.optional(
                Schema.Record(Schema.String, Schema.Unknown),
              ),
              tags: Schema.optional(Schema.Array(Schema.String)),
              "created-at": Schema.optional(Schema.String),
              "updated-at": Schema.optional(Schema.NullOr(Schema.String)),
            }),
          ),
          relationships: Schema.optional(
            Schema.Struct({
              reviewer: Schema.optional(
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
              "transaction-label": Schema.optional(
                Schema.Struct({
                  data: Schema.optional(
                    Schema.NullOr(
                      Schema.Struct({
                        type: Schema.optional(
                          Schema.Literals(["transaction-label"]),
                        ),
                        id: Schema.optional(Schema.String),
                      }),
                    ),
                  ),
                }),
              ),
              "transaction-type": Schema.optional(
                Schema.Struct({
                  data: Schema.optional(
                    Schema.Struct({
                      type: Schema.optional(
                        Schema.Literals(["transaction-type"]),
                      ),
                      id: Schema.optional(Schema.String),
                    }),
                  ),
                }),
              ),
              "related-objects": Schema.optional(
                Schema.Struct({
                  data: Schema.optional(
                    Schema.Array(
                      Schema.Struct({
                        type: Schema.optional(Schema.String),
                        id: Schema.optional(Schema.String),
                      }),
                    ),
                  ),
                }),
              ),
            }),
          ),
        }),
      ]),
    ),
    links: Schema.Struct({
      prev: Schema.NullOr(Schema.String),
      next: Schema.NullOr(Schema.String),
    }),
  }) as unknown as GeneratedStructCodec<AccountsListAllRelationsOutput>;

// The operation
/**
 * Get all relations for an Account
 *
 * Gets relations for an Account by key
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const accountsListAllRelations = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: AccountsListAllRelationsInput,
    outputSchema: AccountsListAllRelationsOutput,
    errors: [
      BadRequest,
      Forbidden,
      NotFound,
      Conflict,
      UnprocessableEntity,
    ] as const,
  }),
);
