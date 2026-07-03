import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export const ListAllApiLogsInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  page: Schema.optional(
    Schema.Struct({
      after: Schema.optional(Schema.String),
      before: Schema.optional(Schema.String),
      size: Schema.optional(Schema.Number),
    }),
  ).pipe(T.HttpQuery("page")),
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
}).pipe(T.Http({ method: "GET", path: "/api-logs" }));
export type ListAllApiLogsInput = typeof ListAllApiLogsInput.Type;

// Output Schema
export const ListAllApiLogsOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
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
  ),
  links: Schema.Struct({
    next: Schema.NullOr(Schema.String),
    prev: Schema.NullOr(Schema.String),
  }),
});
export type ListAllApiLogsOutput = typeof ListAllApiLogsOutput.Type;

// The operation
/**
 * List all API Logs
 *
 * Returns a list of your organization's API Logs. Results are returned in reverse chronological order, with the most recently created objects first.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const listAllApiLogs = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListAllApiLogsInput,
  outputSchema: ListAllApiLogsOutput,
  errors: [BadRequest, Forbidden, NotFound] as const,
}));
