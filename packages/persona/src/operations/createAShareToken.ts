import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { StructWithAdditionalProperties } from "@distilled.cloud/core/openapi/additional-properties";
import {
  BadRequest,
  Forbidden,
  Conflict,
  UnprocessableEntity,
} from "../errors.ts";

// Input Schema
export interface CreateAShareTokenInput {
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
  data: {
    attributes: {
      "connection-id": string;
      "source-id": string;
      "expires-in-seconds"?: number;
    };
  };
}
export const CreateAShareTokenInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
  {
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
    data: Schema.Struct({
      attributes: Schema.Struct({
        "connection-id": Schema.String,
        "source-id": Schema.String,
        "expires-in-seconds": Schema.optional(Schema.Number),
      }),
    }),
  },
).pipe(
  T.Http({ method: "POST", path: "/connect/share-tokens" }),
) as unknown as Schema.Codec<CreateAShareTokenInput>;

// Output Schema
export interface CreateAShareTokenOutput {
  data: {
    type?: string;
    id?: string;
    attributes?: {
      status?: string;
      direction?: string;
      "created-at"?: string;
      "updated-at"?: string;
      "pending-at"?: string | null;
      "redeemed-at"?: string | null;
      "expires-at"?: string | null;
      "failed-at"?: string | null;
      "failure-reason"?: string | null;
      "source-data"?:
        | {
            type: string;
            id: string;
            "peekable-attributes": {
              fields?: Record<
                string,
                | { visibility: string; value: Record<string, unknown> }
                | { visibility: string; value: boolean }
              >;
            } & Record<
              string,
              | { visibility: string; value: Record<string, unknown> }
              | { visibility: string; value: boolean }
              | Record<
                  string,
                  | { visibility: string; value: Record<string, unknown> }
                  | { visibility: string; value: boolean }
                >
            >;
            "related-objects"?: ReadonlyArray<
              | {
                  type: string;
                  id: string;
                  "peekable-attributes": Record<string, unknown>;
                }
              | {
                  type: string;
                  id: string;
                  "peekable-attributes": {
                    fields?: Record<string, unknown>;
                  } & Record<string, unknown | Record<string, unknown>>;
                }
            >;
          }
        | {
            type: string;
            id: string;
            "peekable-attributes": Record<
              string,
              | { visibility: string; value: Record<string, unknown> }
              | { visibility: string; value: boolean }
            >;
          }
        | {
            type: string;
            id: string;
            "peekable-attributes": {
              fields?: Record<
                string,
                | { visibility: string; value: Record<string, unknown> }
                | { visibility: string; value: boolean }
              >;
            } & Record<
              string,
              | { visibility: string; value: Record<string, unknown> }
              | { visibility: string; value: boolean }
              | Record<
                  string,
                  | { visibility: string; value: Record<string, unknown> }
                  | { visibility: string; value: boolean }
                >
            >;
          };
    };
    relationships?: {
      connection?: { data?: { type?: string; id?: string } };
      creator?: { data?: { type?: string; id?: string } };
      source?: { data?: { type?: string; id?: string } };
      destination?: { data?: { type?: string; id?: string } | null };
    };
  };
  included?: ReadonlyArray<unknown>;
}
export const CreateAShareTokenOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Struct({
      type: Schema.optional(Schema.String),
      id: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          status: Schema.optional(Schema.String),
          direction: Schema.optional(Schema.String),
          "created-at": Schema.optional(Schema.String),
          "updated-at": Schema.optional(Schema.String),
          "pending-at": Schema.optional(Schema.NullOr(Schema.String)),
          "redeemed-at": Schema.optional(Schema.NullOr(Schema.String)),
          "expires-at": Schema.optional(Schema.NullOr(Schema.String)),
          "failed-at": Schema.optional(Schema.NullOr(Schema.String)),
          "failure-reason": Schema.optional(Schema.NullOr(Schema.String)),
          "source-data": Schema.optional(
            Schema.Union([
              Schema.Struct({
                type: Schema.String,
                id: Schema.String,
                "peekable-attributes": StructWithAdditionalProperties(
                  Schema.Struct({
                    fields: Schema.optional(
                      Schema.Record(
                        Schema.String,
                        Schema.Union([
                          Schema.Struct({
                            visibility: Schema.String,
                            value: Schema.Record(Schema.String, Schema.Unknown),
                          }),
                          Schema.Struct({
                            visibility: Schema.String,
                            value: Schema.Boolean,
                          }),
                        ]),
                      ),
                    ),
                  }),
                  Schema.Union([
                    Schema.Struct({
                      visibility: Schema.String,
                      value: Schema.Record(Schema.String, Schema.Unknown),
                    }),
                    Schema.Struct({
                      visibility: Schema.String,
                      value: Schema.Boolean,
                    }),
                  ]),
                ),
                "related-objects": Schema.optional(
                  Schema.Array(
                    Schema.Union([
                      Schema.Struct({
                        type: Schema.String,
                        id: Schema.String,
                        "peekable-attributes": Schema.Record(
                          Schema.String,
                          Schema.Unknown,
                        ),
                      }),
                      Schema.Struct({
                        type: Schema.String,
                        id: Schema.String,
                        "peekable-attributes": StructWithAdditionalProperties(
                          Schema.Struct({
                            fields: Schema.optional(
                              Schema.Record(Schema.String, Schema.Unknown),
                            ),
                          }),
                          Schema.Unknown,
                        ),
                      }),
                    ]),
                  ),
                ),
              }),
              Schema.Struct({
                type: Schema.String,
                id: Schema.String,
                "peekable-attributes": Schema.Record(
                  Schema.String,
                  Schema.Union([
                    Schema.Struct({
                      visibility: Schema.String,
                      value: Schema.Record(Schema.String, Schema.Unknown),
                    }),
                    Schema.Struct({
                      visibility: Schema.String,
                      value: Schema.Boolean,
                    }),
                  ]),
                ),
              }),
              Schema.Struct({
                type: Schema.String,
                id: Schema.String,
                "peekable-attributes": StructWithAdditionalProperties(
                  Schema.Struct({
                    fields: Schema.optional(
                      Schema.Record(
                        Schema.String,
                        Schema.Union([
                          Schema.Struct({
                            visibility: Schema.String,
                            value: Schema.Record(Schema.String, Schema.Unknown),
                          }),
                          Schema.Struct({
                            visibility: Schema.String,
                            value: Schema.Boolean,
                          }),
                        ]),
                      ),
                    ),
                  }),
                  Schema.Union([
                    Schema.Struct({
                      visibility: Schema.String,
                      value: Schema.Record(Schema.String, Schema.Unknown),
                    }),
                    Schema.Struct({
                      visibility: Schema.String,
                      value: Schema.Boolean,
                    }),
                  ]),
                ),
              }),
            ]),
          ),
        }),
      ),
      relationships: Schema.optional(
        Schema.Struct({
          connection: Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.Struct({
                  type: Schema.optional(Schema.String),
                  id: Schema.optional(Schema.String),
                }),
              ),
            }),
          ),
          creator: Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.Struct({
                  type: Schema.optional(Schema.String),
                  id: Schema.optional(Schema.String),
                }),
              ),
            }),
          ),
          source: Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.Struct({
                  type: Schema.optional(Schema.String),
                  id: Schema.optional(Schema.String),
                }),
              ),
            }),
          ),
          destination: Schema.optional(
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
        }),
      ),
    }),
    included: Schema.optional(Schema.Array(Schema.Unknown)),
  }) as unknown as Schema.Codec<CreateAShareTokenOutput>;

// The operation
/**
 * Create a Share Token
 *
 * Creates a new Share Token with the specified connection and source.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const createAShareToken = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateAShareTokenInput,
  outputSchema: CreateAShareTokenOutput,
  errors: [BadRequest, Forbidden, Conflict, UnprocessableEntity] as const,
}));
