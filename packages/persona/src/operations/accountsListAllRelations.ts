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
    | ({ type: "account"; id: string } & Record<string, unknown>)
    | ({ type: "transaction"; id: string } & Record<string, unknown>)
  >;
  links: { prev: string | null; next: string | null };
}
export const AccountsListAllRelationsOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Union(
        [
          StructWithAdditionalProperties(
            Schema.Struct({
              type: Schema.Literals(["account"]),
              id: Schema.String,
            }),
            Schema.Unknown,
          ),
          StructWithAdditionalProperties(
            Schema.Struct({
              type: Schema.Literals(["transaction"]),
              id: Schema.String,
            }),
            Schema.Unknown,
          ),
        ],
        { mode: "oneOf" },
      ),
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
