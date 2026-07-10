import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";
import { SensitiveOutputString } from "../sensitive.ts";

// Input Schema
export const RetrieveAWebhookInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  webhookId: Schema.String.pipe(T.PathParam()),
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
}).pipe(T.Http({ method: "GET", path: "/webhooks/{webhookId}" }));
export type RetrieveAWebhookInput = typeof RetrieveAWebhookInput.Type;

// Output Schema
export const RetrieveAWebhookOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
  {
    data: Schema.Struct({
      type: Schema.optional(Schema.String),
      id: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          status: Schema.optional(Schema.String),
          url: Schema.optional(Schema.String),
          name: Schema.optional(Schema.NullOr(Schema.String)),
          description: Schema.optional(Schema.NullOr(Schema.String)),
          secret: Schema.optional(SensitiveOutputString),
          secrets: Schema.optional(
            Schema.Array(
              Schema.Struct({
                value: Schema.optional(Schema.String),
                "expires-at": Schema.optional(Schema.NullOr(Schema.String)),
              }),
            ),
          ),
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
    included: Schema.optional(Schema.Array(Schema.Unknown)),
  },
);
export type RetrieveAWebhookOutput = typeof RetrieveAWebhookOutput.Type;

// The operation
/**
 * Retrieve a Webhook
 *
 * Retrieves the details of an existing webhook, including its secret.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 * @param webhookId - Webhook's ID (starts with "wbh_")
 */
export const retrieveAWebhook = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: RetrieveAWebhookInput,
  outputSchema: RetrieveAWebhookOutput,
  errors: [BadRequest, Forbidden, NotFound] as const,
}));
