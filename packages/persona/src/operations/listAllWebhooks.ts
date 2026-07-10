import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden } from "../errors.ts";

// Input Schema
export const ListAllWebhooksInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
}).pipe(T.Http({ method: "GET", path: "/webhooks" }));
export type ListAllWebhooksInput = typeof ListAllWebhooksInput.Type;

// Output Schema
export const ListAllWebhooksOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
      type: Schema.optional(Schema.String),
      id: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          status: Schema.optional(Schema.String),
          url: Schema.optional(Schema.String),
          name: Schema.optional(Schema.NullOr(Schema.String)),
          description: Schema.optional(Schema.NullOr(Schema.String)),
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
          "file-access-token-expires-in": Schema.optional(Schema.Number),
          "enabled-events": Schema.optional(Schema.Array(Schema.String)),
          "payload-filter": Schema.optional(Schema.NullOr(Schema.Unknown)),
          "included-allowlist": Schema.optional(Schema.Unknown),
          "relationship-allowlist": Schema.optional(Schema.Unknown),
          "created-at": Schema.optional(Schema.String),
        }),
      ),
    }),
  ),
  links: Schema.Struct({
    next: Schema.NullOr(Schema.String),
    prev: Schema.NullOr(Schema.String),
  }),
});
export type ListAllWebhooksOutput = typeof ListAllWebhooksOutput.Type;

// The operation
/**
 * List all Webhooks
 *
 * Returns a list of your environment's webhooks. Results are returned in reverse chronological order, with the most recently created objects first.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const listAllWebhooks = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListAllWebhooksInput,
  outputSchema: ListAllWebhooksOutput,
  errors: [BadRequest, Forbidden] as const,
}));
