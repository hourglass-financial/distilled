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
export interface CreateAConnectConnectionInput {
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
  data?: { attributes?: { "destination-organization-id": string } };
}
export const CreateAConnectConnectionInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
    data: Schema.optional(
      Schema.Struct({
        attributes: Schema.optional(
          Schema.Struct({
            "destination-organization-id": Schema.String,
          }),
        ),
      }),
    ),
  }).pipe(
    T.Http({ method: "POST", path: "/connect/connections" }),
  ) as unknown as Schema.Codec<CreateAConnectConnectionInput>;

// Output Schema
export interface CreateAConnectConnectionOutput {
  data: {
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
  };
}
export const CreateAConnectConnectionOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Struct({
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
  }) as unknown as Schema.Codec<CreateAConnectConnectionOutput>;

// The operation
/**
 * Create a Connection
 *
 * Creates a new Connection from your organization to a destination organization in the `pending` state. The destination organization must accept the connection before it transitions to `active`; share tokens cannot be redeemed through the connection until then. Connections cannot be deleted, but they can be deactivated and later reactivated to control access.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const createAConnectConnection = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: CreateAConnectConnectionInput,
    outputSchema: CreateAConnectConnectionOutput,
    errors: [BadRequest, Forbidden, Conflict, UnprocessableEntity] as const,
  }),
);
