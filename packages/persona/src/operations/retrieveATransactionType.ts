import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface RetrieveATransactionTypeInput {
  transactionTypeId: string;
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
}
export const RetrieveATransactionTypeInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    transactionTypeId: Schema.String.pipe(T.PathParam()),
    include: Schema.optional(Schema.String).pipe(T.HttpQuery("include")),
    fields: Schema.optional(Schema.Record(Schema.String, Schema.String)).pipe(
      T.HttpQuery("fields", { style: "deepObject", explode: true }),
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
    T.Http({ method: "GET", path: "/transaction-types/{transactionTypeId}" }),
  ) as unknown as Schema.Codec<RetrieveATransactionTypeInput>;

// Output Schema
export interface RetrieveATransactionTypeOutput {
  data: {
    type?: string;
    id?: string;
    attributes?: {
      name?: string;
      "created-at"?: string;
      "updated-at"?: string | null;
      "field-schemas"?: ReadonlyArray<
        | {
            type?: string;
            key?: string;
            label?: string | null;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
              "item-schema"?: unknown;
            };
          }
        | {
            type?: string;
            key?: string;
            label?: string | null;
            "default-value"?: boolean | null;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
            };
          }
        | {
            type?: string;
            key?: string;
            label?: string | null;
            "default-value"?: string | null;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
              "allow-empty"?: boolean;
              options?: ReadonlyArray<string>;
              "option-labels"?: ReadonlyArray<string>;
            };
          }
        | {
            type?: string;
            key?: string;
            label?: string | null;
            "default-value"?: string | null;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
              "min-date"?: string | null;
              "max-date"?: string | null;
            };
          }
        | {
            type?: string;
            key?: string;
            label?: string | null;
            "default-value"?: string | null;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
            };
          }
        | {
            type?: string;
            key?: string;
            label?: string | null;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
              "max-file-size-bytes"?: number;
              "min-file-size-bytes"?: number;
              "supported-mime-types"?: ReadonlyArray<string>;
              "page-count-limit-enabled"?: boolean;
              "page-count-min"?: number | null;
              "page-count-max"?: number | null;
            };
          }
        | {
            type?: string;
            key?: string;
            label?: string | null;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
              "ignore-unknown-keys"?: boolean;
              "item-schemas"?: ReadonlyArray<unknown>;
            };
          }
        | {
            type?: string;
            key?: string;
            label?: string | null;
            "default-value"?: number | null;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
              min?: number;
              max?: number;
            };
          }
        | {
            type?: string;
            key?: string;
            label?: string | null;
            "default-value"?: unknown;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
              "json-schema"?: Record<string, unknown>;
            };
          }
        | {
            type?: string;
            key?: string;
            label?: string | null;
            "default-value"?: ReadonlyArray<string> | null;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
              "allow-empty"?: boolean;
              options?: ReadonlyArray<string>;
              "option-labels"?: ReadonlyArray<string>;
            };
          }
        | {
            type?: string;
            key?: string;
            label?: string | null;
            "default-value"?: string | null;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
              "max-char-length"?: number;
              sanitize?: ReadonlyArray<string>;
            };
          }
        | {
            type?: string;
            key?: string;
            label?: string | null;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
              target?: string;
            };
          }
      >;
    };
  };
  included?: ReadonlyArray<unknown>;
}
export const RetrieveATransactionTypeOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Struct({
      type: Schema.optional(Schema.String),
      id: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          name: Schema.optional(Schema.String),
          "created-at": Schema.optional(Schema.String),
          "updated-at": Schema.optional(Schema.NullOr(Schema.String)),
          "field-schemas": Schema.optional(Schema.Array(Schema.Unknown)),
        }),
      ),
    }),
    included: Schema.optional(Schema.Array(Schema.Unknown)),
  }) as unknown as Schema.Codec<RetrieveATransactionTypeOutput>;

// The operation
/**
 * Retrieve a Transaction Type
 *
 * Retrieves the details of an existing Transaction Type.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 * @param transactionTypeId - ID of the Transaction Type to retrieve.
 */
export const retrieveATransactionType = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: RetrieveATransactionTypeInput,
    outputSchema: RetrieveATransactionTypeOutput,
    errors: [BadRequest, Forbidden, NotFound] as const,
  }),
);
