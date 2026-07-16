import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import {
  BadRequest,
  Forbidden,
  Conflict,
  UnprocessableEntity,
} from "../errors.ts";

// Input Schema
export interface CreateAnApiKeyInput {
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
      name: string;
      note?: string;
      "api-version"?:
        | "2025-12-08"
        | "2025-10-27"
        | "2023-01-05"
        | "2022-09-01"
        | "2021-08-18"
        | "2021-07-05"
        | "2021-02-21"
        | "2020-05-18";
      "api-key-inflection"?: string;
      "api-attributes-blocklist"?: ReadonlyArray<string>;
      "ip-address-allowlist"?: ReadonlyArray<string>;
      permissions?: ReadonlyArray<string>;
      "file-access-token-expires-in"?: number;
    };
  };
}
export const CreateAnApiKeyInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
  data: Schema.Struct({
    attributes: Schema.Struct({
      name: Schema.String,
      note: Schema.optional(Schema.String),
      "api-version": Schema.optional(
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
      ),
      "api-key-inflection": Schema.optional(Schema.String),
      "api-attributes-blocklist": Schema.optional(Schema.Array(Schema.String)),
      "ip-address-allowlist": Schema.optional(Schema.Array(Schema.String)),
      permissions: Schema.optional(Schema.Array(Schema.String)),
      "file-access-token-expires-in": Schema.optional(Schema.Number),
    }),
  }),
}).pipe(
  T.Http({ method: "POST", path: "/api-keys" }),
) as unknown as Schema.Codec<CreateAnApiKeyInput>;

// Output Schema
export interface CreateAnApiKeyOutput {
  data: {
    type?: string;
    id?: string;
    attributes?: {
      name?: string;
      note?: string | null;
      "api-version"?:
        | "2025-12-08"
        | "2025-10-27"
        | "2023-01-05"
        | "2022-09-01"
        | "2021-08-18"
        | "2021-07-05"
        | "2021-02-21"
        | "2020-05-18";
      "api-key-inflection"?: string;
      "api-attributes-blocklist"?: ReadonlyArray<string | null>;
      permissions?: ReadonlyArray<string>;
      "ip-address-allowlist"?: ReadonlyArray<string>;
      "file-access-token-expires-in"?: number;
      "last-used-at"?: string | null;
      "expires-at"?: string | null;
      "created-at"?: string;
      value?: string;
    };
  };
  included?: ReadonlyArray<unknown>;
}
export const CreateAnApiKeyOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Struct({
    type: Schema.optional(Schema.String),
    id: Schema.optional(Schema.String),
    attributes: Schema.optional(
      Schema.Struct({
        name: Schema.optional(Schema.String),
        note: Schema.optional(Schema.NullOr(Schema.String)),
        "api-version": Schema.optional(
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
        ),
        "api-key-inflection": Schema.optional(Schema.String),
        "api-attributes-blocklist": Schema.optional(
          Schema.Array(Schema.NullOr(Schema.String)),
        ),
        permissions: Schema.optional(Schema.Array(Schema.String)),
        "ip-address-allowlist": Schema.optional(Schema.Array(Schema.String)),
        "file-access-token-expires-in": Schema.optional(Schema.Number),
        "last-used-at": Schema.optional(Schema.NullOr(Schema.String)),
        "expires-at": Schema.optional(Schema.NullOr(Schema.String)),
        "created-at": Schema.optional(Schema.String),
        value: Schema.optional(Schema.String),
      }),
    ),
  }),
  included: Schema.optional(Schema.Array(Schema.Unknown)),
}) as unknown as Schema.Codec<CreateAnApiKeyOutput>;

// The operation
/**
 * Create an API key
 *
 * Creates a new API key with response defaults and permissions.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const createAnApiKey = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateAnApiKeyInput,
  outputSchema: CreateAnApiKeyOutput,
  errors: [BadRequest, Forbidden, Conflict, UnprocessableEntity] as const,
}));
