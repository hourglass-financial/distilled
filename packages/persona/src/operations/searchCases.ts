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
export const SearchCasesInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  fields: Schema.optional(Schema.Record(Schema.String, Schema.String)).pipe(
    T.HttpQuery("fields"),
  ),
  page: Schema.optional(
    Schema.Struct({
      after: Schema.optional(Schema.String),
      before: Schema.optional(Schema.String),
      size: Schema.optional(Schema.Number),
    }),
  ).pipe(T.HttpQuery("page")),
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
  query: Schema.optional(Schema.Unknown),
  sort: Schema.optional(
    Schema.Struct({
      attribute: Schema.String,
      direction: Schema.String,
    }),
  ),
}).pipe(T.Http({ method: "POST", path: "/cases/search" }));
export type SearchCasesInput = typeof SearchCasesInput.Type;

// Output Schema
export const SearchCasesOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
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
  ),
  links: Schema.Struct({
    prev: Schema.NullOr(Schema.String),
    next: Schema.NullOr(Schema.String),
  }),
});
export type SearchCasesOutput = typeof SearchCasesOutput.Type;

// The operation
/**
 * Search Cases
 *
 * Search for cases using a flexible query language.
 * ## Search vs. List Endpoints
 * The Search and List endpoints serve different purposes and have distinct performance characteristics.
 * Use the **Search** endpoint (`POST /cases/search`) when you need to perform complex queries with boolean logic (AND/OR/NOT), filter by custom fields, assignee, case queue, or SLA expiration, or apply multiple conditions simultaneously. Search is optimized for flexible querying and is faster than paginating through all resources when looking for specific records.
 * Use the **List** endpoint (`GET /cases`) for simple listing with basic filters like status, case template, account, inquiry, or report.
 * ## Data Freshness
 * Do not use search for read-after-write flows because the data will not be immediately available to search.
 * Under normal operating conditions, data is searchable within approximately 1 minute of creation or modification.
 * Propagation of new or updated data could be delayed during an outage.
 * For workflows that require immediate data availability after creating or updating a case, use the List Cases endpoint instead.
 * ### Searchable Attributes
 * The following attributes can be used in query predicates:
 * **Note:** Custom fields (`fields.*`) must be configured as searchable on the Case Template to be queryable.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const searchCases = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: SearchCasesInput,
  outputSchema: SearchCasesOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
