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
export interface CreateAGraphQueryInput {
  include?: string;
  fields?: Record<string, string>;
  data: {
    attributes: {
      "graph-query-template-id": string;
      "parameter-map"?: Record<string, unknown>;
      "variable-map"?: Record<string, unknown>;
      "timeout-in-seconds"?: number;
    };
  };
  meta?: { "run-sync"?: boolean };
}
export const CreateAGraphQueryInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
  {
    include: Schema.optional(Schema.String).pipe(T.HttpQuery("include")),
    fields: Schema.optional(Schema.Record(Schema.String, Schema.String)).pipe(
      T.HttpQuery("fields", { style: "deepObject", explode: true }),
    ),
    data: Schema.Struct({
      attributes: Schema.Struct({
        "graph-query-template-id": Schema.String,
        "parameter-map": Schema.optional(
          Schema.Record(Schema.String, Schema.Unknown),
        ),
        "variable-map": Schema.optional(
          Schema.Record(Schema.String, Schema.Unknown),
        ),
        "timeout-in-seconds": Schema.optional(Schema.Number),
      }),
    }),
    meta: Schema.optional(
      Schema.Struct({
        "run-sync": Schema.optional(Schema.Boolean),
      }),
    ),
  },
).pipe(
  T.Http({ method: "POST", path: "/graph-queries" }),
) as unknown as Schema.Codec<CreateAGraphQueryInput>;

// Output Schema
export interface CreateAGraphQueryOutput {
  data: {
    type?: string;
    id?: string;
    attributes?: {
      status?: string;
      params?: Record<string, unknown>;
      "created-at"?: string;
      "updated-at"?: string | null;
      "errored-at"?: string | null;
      "completed-at"?: string | null;
      "redacted-at"?: string | null;
      stats?: unknown;
      "explorer-url"?: string | null;
      "node-limit-reached"?: boolean | null;
      nodes?: ReadonlyArray<{ type?: string; value?: string }>;
    };
    relationships?: {
      accounts?: { data?: ReadonlyArray<{ id?: string; type?: string }> };
    };
  };
  included?: ReadonlyArray<{
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
}
export const CreateAGraphQueryOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Struct({
      type: Schema.optional(Schema.String),
      id: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          status: Schema.optional(Schema.String),
          params: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
          "created-at": Schema.optional(Schema.String),
          "updated-at": Schema.optional(Schema.NullOr(Schema.String)),
          "errored-at": Schema.optional(Schema.NullOr(Schema.String)),
          "completed-at": Schema.optional(Schema.NullOr(Schema.String)),
          "redacted-at": Schema.optional(Schema.NullOr(Schema.String)),
          stats: Schema.optional(Schema.Unknown),
          "explorer-url": Schema.optional(Schema.NullOr(Schema.String)),
          "node-limit-reached": Schema.optional(Schema.NullOr(Schema.Boolean)),
          nodes: Schema.optional(
            Schema.Array(
              Schema.Struct({
                type: Schema.optional(Schema.String),
                value: Schema.optional(Schema.String),
              }),
            ),
          ),
        }),
      ),
      relationships: Schema.optional(
        Schema.Struct({
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
        }),
      ),
    }),
    included: Schema.optional(
      Schema.Array(
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
    ),
  }) as unknown as Schema.Codec<CreateAGraphQueryOutput>;

// The operation
/**
 * Create a Graph Query
 *
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const createAGraphQuery = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateAGraphQueryInput,
  outputSchema: CreateAGraphQueryOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
