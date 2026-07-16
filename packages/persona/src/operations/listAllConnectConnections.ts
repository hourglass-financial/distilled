import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface ListAllConnectConnectionsInput {
  page?: { after?: string; before?: string; size?: number };
  fields?: Record<string, string>;
  filter?: { status?: string; "destination-organization-id"?: string };
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
export const ListAllConnectConnectionsInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    page: Schema.optional(
      Schema.Struct({
        after: Schema.optional(Schema.String),
        before: Schema.optional(Schema.String),
        size: Schema.optional(Schema.Number),
      }),
    ).pipe(T.HttpQuery("page", { style: "deepObject", explode: true })),
    fields: Schema.optional(Schema.Record(Schema.String, Schema.String)).pipe(
      T.HttpQuery("fields", { style: "deepObject", explode: true }),
    ),
    filter: Schema.optional(
      Schema.Struct({
        status: Schema.optional(Schema.String),
        "destination-organization-id": Schema.optional(Schema.String),
      }),
    ).pipe(T.HttpQuery("filter", { style: "deepObject", explode: true })),
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
    T.Http({ method: "GET", path: "/connect/connections" }),
  ) as unknown as Schema.Codec<ListAllConnectConnectionsInput>;

// Output Schema
export interface ListAllConnectConnectionsOutput {
  data: ReadonlyArray<{
    type?: string;
    id?: string;
    attributes?: {
      status?: string;
      "destination-organization-id"?: string;
      "source-organization-id"?: string;
      "created-at"?: string;
      "updated-at"?: string;
    };
    relationships?: { creator?: { data: { id: string; type: string } } };
  }>;
  links: { prev: string | null; next: string | null };
}
export const ListAllConnectConnectionsOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
        type: Schema.optional(Schema.String),
        id: Schema.optional(Schema.String),
        attributes: Schema.optional(
          Schema.Struct({
            status: Schema.optional(Schema.String),
            "destination-organization-id": Schema.optional(Schema.String),
            "source-organization-id": Schema.optional(Schema.String),
            "created-at": Schema.optional(Schema.String),
            "updated-at": Schema.optional(Schema.String),
          }),
        ),
        relationships: Schema.optional(
          Schema.Struct({
            creator: Schema.optional(
              Schema.Struct({
                data: Schema.Struct({
                  id: Schema.String,
                  type: Schema.String,
                }),
              }),
            ),
          }),
        ),
      }),
    ),
    links: Schema.Struct({
      prev: Schema.NullOr(Schema.String),
      next: Schema.NullOr(Schema.String),
    }),
  }) as unknown as Schema.Codec<ListAllConnectConnectionsOutput>;

// The operation
/**
 * List all Connections
 *
 * Returns a list of connect connections associated with your organization, including both outbound connections your organization created and inbound connections where your organization is the destination. Results are returned in reverse chronological order, with the most recently created objects first.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const listAllConnectConnections = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: ListAllConnectConnectionsInput,
    outputSchema: ListAllConnectConnectionsOutput,
    errors: [BadRequest, Forbidden, NotFound] as const,
  }),
);
