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
export const AssignACaseInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  caseId: Schema.String.pipe(T.PathParam()),
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
  meta: Schema.Struct({
    "user-email-address": Schema.String,
  }),
}).pipe(T.Http({ method: "POST", path: "/cases/{caseId}/assign" }));
export type AssignACaseInput = typeof AssignACaseInput.Type;

// Output Schema
export const AssignACaseOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Struct({
    type: Schema.optional(Schema.String),
    id: Schema.optional(Schema.String),
    attributes: Schema.optional(
      Schema.Struct({
        status: Schema.optional(Schema.String),
        name: Schema.optional(Schema.String),
        resolution: Schema.optional(Schema.NullOr(Schema.String)),
        "created-at": Schema.optional(Schema.String),
        "updated-at": Schema.optional(Schema.NullOr(Schema.String)),
        "assigned-at": Schema.optional(Schema.NullOr(Schema.String)),
        "resolved-at": Schema.optional(Schema.NullOr(Schema.String)),
        "redacted-at": Schema.optional(Schema.NullOr(Schema.String)),
        "sla-expires-at": Schema.optional(Schema.NullOr(Schema.String)),
        "creator-id": Schema.optional(Schema.NullOr(Schema.String)),
        "creator-type": Schema.optional(Schema.NullOr(Schema.String)),
        "assignee-id": Schema.optional(Schema.NullOr(Schema.String)),
        "assigner-id": Schema.optional(Schema.NullOr(Schema.String)),
        "assigner-type": Schema.optional(Schema.NullOr(Schema.String)),
        "resolver-id": Schema.optional(Schema.NullOr(Schema.String)),
        "resolver-type": Schema.optional(Schema.NullOr(Schema.String)),
        "updater-id": Schema.optional(Schema.NullOr(Schema.String)),
        "updater-type": Schema.optional(Schema.NullOr(Schema.String)),
        tags: Schema.optional(Schema.Array(Schema.Unknown)),
        fields: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
        attachments: Schema.optional(
          Schema.Array(
            Schema.Struct({
              filename: Schema.optional(Schema.String),
              url: Schema.optional(Schema.String),
              "byte-size": Schema.optional(Schema.Number),
            }),
          ),
        ),
      }),
    ),
    relationships: Schema.optional(
      Schema.Struct({
        accounts: Schema.optional(
          Schema.Struct({
            data: Schema.optional(
              Schema.Array(
                Schema.Struct({
                  id: Schema.optional(Schema.String),
                  type: Schema.optional(Schema.String),
                }),
              ),
            ),
          }),
        ),
        "case-comments": Schema.optional(
          Schema.Struct({
            data: Schema.optional(
              Schema.Array(
                Schema.Struct({
                  id: Schema.optional(Schema.String),
                  type: Schema.optional(Schema.String),
                }),
              ),
            ),
          }),
        ),
        "case-template": Schema.optional(
          Schema.Struct({
            data: Schema.optional(
              Schema.Struct({
                id: Schema.optional(Schema.String),
                type: Schema.optional(Schema.String),
              }),
            ),
          }),
        ),
        "case-queue": Schema.optional(
          Schema.Struct({
            data: Schema.optional(
              Schema.NullOr(
                Schema.Struct({
                  id: Schema.optional(Schema.String),
                  type: Schema.optional(Schema.String),
                }),
              ),
            ),
          }),
        ),
        inquiries: Schema.optional(
          Schema.Struct({
            data: Schema.optional(
              Schema.Array(
                Schema.Struct({
                  id: Schema.optional(Schema.String),
                  type: Schema.optional(Schema.String),
                }),
              ),
            ),
          }),
        ),
        reports: Schema.optional(
          Schema.Struct({
            data: Schema.optional(
              Schema.Array(
                Schema.Struct({
                  id: Schema.optional(Schema.String),
                  type: Schema.optional(Schema.String),
                }),
              ),
            ),
          }),
        ),
        verifications: Schema.optional(
          Schema.Struct({
            data: Schema.optional(
              Schema.Array(
                Schema.Struct({
                  id: Schema.optional(Schema.String),
                  type: Schema.optional(Schema.String),
                }),
              ),
            ),
          }),
        ),
        txns: Schema.optional(
          Schema.Struct({
            data: Schema.optional(
              Schema.Array(
                Schema.Struct({
                  id: Schema.optional(Schema.String),
                  type: Schema.optional(Schema.String),
                }),
              ),
            ),
          }),
        ),
      }),
    ),
  }),
  included: Schema.optional(Schema.Array(Schema.Unknown)),
});
export type AssignACaseOutput = typeof AssignACaseOutput.Type;

// The operation
/**
 * Assign a Case
 *
 * Assigns a Case to a Persona user.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 * @param caseId - ID of the case to update
 */
export const assignACase = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: AssignACaseInput,
  outputSchema: AssignACaseOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
