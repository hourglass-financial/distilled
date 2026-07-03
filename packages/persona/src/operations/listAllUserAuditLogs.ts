import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export const ListAllUserAuditLogsInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
  }).pipe(T.Http({ method: "GET", path: "/user-audit-logs" }));
export type ListAllUserAuditLogsInput = typeof ListAllUserAuditLogsInput.Type;

// Output Schema
export const ListAllUserAuditLogsOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
        type: Schema.optional(Schema.String),
        id: Schema.optional(Schema.String),
        attributes: Schema.optional(
          Schema.Struct({
            path: Schema.optional(Schema.String),
            method: Schema.optional(Schema.String),
            "get-params": Schema.optional(
              Schema.Record(Schema.String, Schema.Unknown),
            ),
            "post-params": Schema.optional(
              Schema.Record(Schema.String, Schema.Unknown),
            ),
            "ip-address": Schema.optional(Schema.String),
            "user-agent": Schema.optional(Schema.String),
            "response-status": Schema.optional(Schema.Number),
            "created-at": Schema.optional(Schema.String),
            "impersonator-email-address": Schema.optional(
              Schema.NullOr(Schema.String),
            ),
            context: Schema.optional(
              Schema.Struct({
                "inquiry-id": Schema.optional(Schema.String),
              }),
            ),
          }),
        ),
        relationships: Schema.optional(
          Schema.Struct({
            user: Schema.optional(
              Schema.Struct({
                data: Schema.optional(
                  Schema.Struct({
                    type: Schema.optional(Schema.String),
                    id: Schema.optional(Schema.String),
                  }),
                ),
              }),
            ),
            "user-session": Schema.optional(
              Schema.Struct({
                data: Schema.optional(
                  Schema.Struct({
                    type: Schema.optional(Schema.String),
                    id: Schema.optional(Schema.String),
                  }),
                ),
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
    included: Schema.optional(
      Schema.Array(
        Schema.Struct({
          type: Schema.optional(Schema.String),
          id: Schema.optional(Schema.String),
          attributes: Schema.optional(
            Schema.Struct({
              "email-address": Schema.optional(Schema.String),
              "name-first": Schema.optional(Schema.String),
              "name-last": Schema.optional(Schema.String),
            }),
          ),
        }),
      ),
    ),
  });
export type ListAllUserAuditLogsOutput = typeof ListAllUserAuditLogsOutput.Type;

// The operation
/**
 * List all User Audit Logs
 *
 * Returns a list of your organization’s user audit logs for up to the most recent 6 months.
 * Note: You must use a production API key to access this endpoint. For security reasons, we do not expose organization-level resources like user audit logs in Sandbox via API. Results are returned in reverse chronological order, with the most recently created objects first.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const listAllUserAuditLogs = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: ListAllUserAuditLogsInput,
    outputSchema: ListAllUserAuditLogsOutput,
    errors: [BadRequest, Forbidden, NotFound] as const,
  }),
);
