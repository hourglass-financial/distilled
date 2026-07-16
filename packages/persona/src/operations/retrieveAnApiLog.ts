import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface RetrieveAnApiLogInput {
  apiLogId: string;
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
export const RetrieveAnApiLogInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  apiLogId: Schema.String.pipe(T.PathParam()),
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
  T.Http({ method: "GET", path: "/api-logs/{apiLogId}" }),
) as unknown as Schema.Codec<RetrieveAnApiLogInput>;

// Output Schema
export interface RetrieveAnApiLogOutput {
  data: {
    type?: string;
    id?: string;
    attributes?: {
      request?: {
        method?: string;
        path?: string;
        headers?: {
          Accept?: string;
          Authorization?: string;
          Host?: string;
          "Persona-Version"?: string;
          "User-Agent"?: string;
        };
        "get-params"?: Record<string, unknown>;
        "post-params"?: Record<string, unknown>;
        "ip-address"?: string;
      };
      response?: {
        status?: number;
        headers?: {
          "Persona-Host"?: string;
          "Cache-Control"?: string;
          Pragma?: string;
          Expires?: string;
          "RateLimit-Limit"?: number;
          "RateLimit-Remaining"?: number;
          "RateLimit-Reset"?: number;
          "Quota-Limit"?: number;
          "Quota-Remaining"?: number;
          "Quota-Reset"?: number;
          "Request-Id"?: string;
          "Content-Type"?: string;
          Vary?: string;
        };
      };
      "created-at"?: string;
      "redacted-at"?: string | null;
    };
  };
  included?: ReadonlyArray<unknown>;
}
export const RetrieveAnApiLogOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
  {
    data: Schema.Struct({
      type: Schema.optional(Schema.String),
      id: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          request: Schema.optional(
            Schema.Struct({
              method: Schema.optional(Schema.String),
              path: Schema.optional(Schema.String),
              headers: Schema.optional(
                Schema.Struct({
                  Accept: Schema.optional(Schema.String),
                  Authorization: Schema.optional(Schema.String),
                  Host: Schema.optional(Schema.String),
                  "Persona-Version": Schema.optional(Schema.String),
                  "User-Agent": Schema.optional(Schema.String),
                }),
              ),
              "get-params": Schema.optional(
                Schema.Record(Schema.String, Schema.Unknown),
              ),
              "post-params": Schema.optional(
                Schema.Record(Schema.String, Schema.Unknown),
              ),
              "ip-address": Schema.optional(Schema.String),
            }),
          ),
          response: Schema.optional(
            Schema.Struct({
              status: Schema.optional(Schema.Number),
              headers: Schema.optional(
                Schema.Struct({
                  "Persona-Host": Schema.optional(Schema.String),
                  "Cache-Control": Schema.optional(Schema.String),
                  Pragma: Schema.optional(Schema.String),
                  Expires: Schema.optional(Schema.String),
                  "RateLimit-Limit": Schema.optional(Schema.Number),
                  "RateLimit-Remaining": Schema.optional(Schema.Number),
                  "RateLimit-Reset": Schema.optional(Schema.Number),
                  "Quota-Limit": Schema.optional(Schema.Number),
                  "Quota-Remaining": Schema.optional(Schema.Number),
                  "Quota-Reset": Schema.optional(Schema.Number),
                  "Request-Id": Schema.optional(Schema.String),
                  "Content-Type": Schema.optional(Schema.String),
                  Vary: Schema.optional(Schema.String),
                }),
              ),
            }),
          ),
          "created-at": Schema.optional(Schema.String),
          "redacted-at": Schema.optional(Schema.NullOr(Schema.String)),
        }),
      ),
    }),
    included: Schema.optional(Schema.Array(Schema.Unknown)),
  },
) as unknown as Schema.Codec<RetrieveAnApiLogOutput>;

// The operation
/**
 * Retrieve an API Log
 *
 * Retrieves the details of an existing API Log.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const retrieveAnApiLog = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: RetrieveAnApiLogInput,
  outputSchema: RetrieveAnApiLogOutput,
  errors: [BadRequest, Forbidden, NotFound] as const,
}));
