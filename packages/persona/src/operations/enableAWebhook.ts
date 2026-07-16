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
export interface EnableAWebhookInput {
  webhookId: string;
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
export const EnableAWebhookInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
}).pipe(
  T.Http({ method: "POST", path: "/webhooks/{webhookId}/enable" }),
) as unknown as Schema.Codec<EnableAWebhookInput>;

// Output Schema
export interface EnableAWebhookOutput {
  data: {
    type?: string;
    id?: string;
    attributes?: {
      status?: string;
      url?: string;
      name?: string | null;
      description?: string | null;
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
      "file-access-token-expires-in"?: number;
      "enabled-events"?: ReadonlyArray<string>;
      "payload-filter"?: unknown | null;
      "included-allowlist"?:
        | { state: string }
        | {
            state: string;
            "event-types": ReadonlyArray<{
              "event-type": string;
              relationships: ReadonlyArray<string>;
            }>;
          }
        | null;
      "relationship-allowlist"?: { state: string };
      "created-at"?: string;
    };
  };
  included?: ReadonlyArray<unknown>;
}
export const EnableAWebhookOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Struct({
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
        "included-allowlist": Schema.optional(
          Schema.NullOr(
            Schema.Union([
              Schema.Struct({
                state: Schema.String,
              }),
              Schema.Struct({
                state: Schema.String,
                "event-types": Schema.Array(
                  Schema.Struct({
                    "event-type": Schema.String,
                    relationships: Schema.Array(Schema.String),
                  }),
                ),
              }),
            ]),
          ),
        ),
        "relationship-allowlist": Schema.optional(
          Schema.Struct({
            state: Schema.String,
          }),
        ),
        "created-at": Schema.optional(Schema.String),
      }),
    ),
  }),
  included: Schema.optional(Schema.Array(Schema.Unknown)),
}) as unknown as Schema.Codec<EnableAWebhookOutput>;

// The operation
/**
 * Enable a Webhook
 *
 * Enables a webhook.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 * @param webhookId - Webhook's ID (starts with "wbh_")
 */
export const enableAWebhook = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: EnableAWebhookInput,
  outputSchema: EnableAWebhookOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
