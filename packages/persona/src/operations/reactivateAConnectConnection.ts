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
export const ReactivateAConnectConnectionInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    connectionId: Schema.String.pipe(T.PathParam()),
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
    T.Http({
      method: "POST",
      path: "/connect/connections/{connectionId}/reactivate",
    }),
  );
export type ReactivateAConnectConnectionInput =
  typeof ReactivateAConnectConnectionInput.Type;

// Output Schema
export const ReactivateAConnectConnectionOutput =
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
  });
export type ReactivateAConnectConnectionOutput =
  typeof ReactivateAConnectConnectionOutput.Type;

// The operation
/**
 * Reactivate a Connection
 *
 * Reactivates an inactive Connection, returning it to the `pending` state. Only the source organization can reactivate a connection. Once reactivated, the destination organization must accept the connection again before it returns to the `active` state. Only inactive connections can be reactivated.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param connectionId - ID of the connect connection
 */
export const reactivateAConnectConnection =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: ReactivateAConnectConnectionInput,
    outputSchema: ReactivateAConnectConnectionOutput,
    errors: [
      BadRequest,
      Forbidden,
      NotFound,
      Conflict,
      UnprocessableEntity,
    ] as const,
  }));
