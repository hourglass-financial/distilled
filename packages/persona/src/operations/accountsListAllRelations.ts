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
export interface AccountsListAllRelationsInput {
  accountId: string;
  include?: string;
  fields?: Record<string, string>;
  filter: {
    key: string;
    "created-at-start"?: string;
    "created-at-end"?: string;
  };
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
  ) as unknown as Schema.Codec<AccountsListAllRelationsInput>;

// Output Schema
export interface AccountsListAllRelationsOutput {
  data: ReadonlyArray<
    | {
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
      }
    | {
        id?: string;
        type?: string;
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
            data?: { type?: string; id?: string } | null;
          };
          "transaction-type"?: { data?: { type?: string; id?: string } };
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
    data: Schema.Array(Schema.Unknown),
    links: Schema.Struct({
      prev: Schema.NullOr(Schema.String),
      next: Schema.NullOr(Schema.String),
    }),
  }) as unknown as Schema.Codec<AccountsListAllRelationsOutput>;

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
