import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden } from "../errors.ts";

// Input Schema
export interface RetrieveAnApiKeyInput {
  apiKeyId: string;
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
export const RetrieveAnApiKeyInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  apiKeyId: Schema.String.pipe(T.PathParam()),
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
}).pipe(
  T.Http({ method: "GET", path: "/api-keys/{apiKeyId}" }),
) as unknown as Schema.Codec<RetrieveAnApiKeyInput>;

// Output Schema
export interface RetrieveAnApiKeyOutput {
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
export const RetrieveAnApiKeyOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
  {
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
  },
) as unknown as Schema.Codec<RetrieveAnApiKeyOutput>;

// The operation
/**
 * Retrieve an API key
 *
 * Retrieves the information for an existing API key, including its value.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 * @param apiKeyId - API key's ID (starts with "api_")
 */
export const retrieveAnApiKey = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: RetrieveAnApiKeyInput,
  outputSchema: RetrieveAnApiKeyOutput,
  errors: [BadRequest, Forbidden] as const,
}));
