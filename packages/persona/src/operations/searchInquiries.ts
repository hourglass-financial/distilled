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
export const SearchInquiriesInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
}).pipe(T.Http({ method: "POST", path: "/inquiries/search" }));
export type SearchInquiriesInput = typeof SearchInquiriesInput.Type;

// Output Schema
export const SearchInquiriesOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
      type: Schema.String,
      id: Schema.String,
      attributes: Schema.Struct({
        status: Schema.String,
        "reference-id": Schema.NullOr(Schema.String),
        note: Schema.NullOr(Schema.String),
        behaviors: Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
        tags: Schema.Array(Schema.NullOr(Schema.String)),
        creator: Schema.String,
        "reviewer-comment": Schema.NullOr(Schema.String),
        "created-at": Schema.String,
        "updated-at": Schema.String,
        "started-at": Schema.NullOr(Schema.String),
        "expires-at": Schema.NullOr(Schema.String),
        "completed-at": Schema.NullOr(Schema.String),
        "failed-at": Schema.NullOr(Schema.String),
        "marked-for-review-at": Schema.NullOr(Schema.String),
        "decisioned-at": Schema.NullOr(Schema.String),
        "expired-at": Schema.NullOr(Schema.String),
        "redacted-at": Schema.NullOr(Schema.String),
        "previous-step-name": Schema.NullOr(Schema.String),
        "next-step-name": Schema.NullOr(Schema.String),
        fields: Schema.Struct({
          "name-first": Schema.optional(
            Schema.Struct({
              type: Schema.optional(Schema.String),
              value: Schema.optional(Schema.NullOr(Schema.String)),
            }),
          ),
          "name-middle": Schema.optional(
            Schema.Struct({
              type: Schema.optional(Schema.String),
              value: Schema.optional(Schema.NullOr(Schema.String)),
            }),
          ),
          "name-last": Schema.optional(
            Schema.Struct({
              type: Schema.optional(Schema.String),
              value: Schema.optional(Schema.NullOr(Schema.String)),
            }),
          ),
          "address-street-1": Schema.optional(
            Schema.Struct({
              type: Schema.optional(Schema.String),
              value: Schema.optional(Schema.NullOr(Schema.String)),
            }),
          ),
          "address-street-2": Schema.optional(
            Schema.Struct({
              type: Schema.optional(Schema.String),
              value: Schema.optional(Schema.NullOr(Schema.String)),
            }),
          ),
          "address-city": Schema.optional(
            Schema.Struct({
              type: Schema.optional(Schema.String),
              value: Schema.optional(Schema.NullOr(Schema.String)),
            }),
          ),
          "address-subdivision": Schema.optional(
            Schema.Struct({
              type: Schema.optional(Schema.String),
              value: Schema.optional(Schema.NullOr(Schema.String)),
            }),
          ),
          "address-postal-code": Schema.optional(
            Schema.Struct({
              type: Schema.optional(Schema.String),
              value: Schema.optional(Schema.NullOr(Schema.String)),
            }),
          ),
          "address-country-code": Schema.optional(
            Schema.Struct({
              type: Schema.optional(Schema.String),
              value: Schema.optional(Schema.NullOr(Schema.String)),
            }),
          ),
          birthdate: Schema.optional(
            Schema.Struct({
              type: Schema.optional(Schema.String),
              value: Schema.optional(Schema.NullOr(Schema.String)),
            }),
          ),
          "email-address": Schema.optional(
            Schema.Struct({
              type: Schema.optional(Schema.String),
              value: Schema.optional(Schema.NullOr(Schema.String)),
            }),
          ),
          "phone-number": Schema.optional(
            Schema.Struct({
              type: Schema.optional(Schema.String),
              value: Schema.optional(Schema.NullOr(Schema.String)),
            }),
          ),
          "identification-number": Schema.optional(
            Schema.Struct({
              type: Schema.optional(Schema.String),
              value: Schema.optional(Schema.NullOr(Schema.String)),
            }),
          ),
        }),
      }),
      relationships: Schema.Struct({
        account: Schema.optional(
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
        documents: Schema.optional(
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
        template: Schema.optional(
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
        "inquiry-template": Schema.optional(
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
        "inquiry-template-version": Schema.optional(
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
        transaction: Schema.optional(
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
        reviewer: Schema.optional(
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
        selfies: Schema.optional(
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
        sessions: Schema.optional(
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
      }),
    }),
  ),
  links: Schema.Struct({
    prev: Schema.NullOr(Schema.String),
    next: Schema.NullOr(Schema.String),
  }),
});
export type SearchInquiriesOutput = typeof SearchInquiriesOutput.Type;

// The operation
/**
 * Search Inquiries
 *
 * Search for inquiries using a flexible query language.
 * ## Search vs. List Endpoints
 * The Search and List endpoints serve different purposes and have distinct performance characteristics.
 * Use the **Search** endpoint (`POST /inquiries/search`) when you need to perform complex queries with boolean logic (AND/OR/NOT), filter on multiple statuses simultaneously, or apply multiple conditions at once. Search is optimized for flexible querying and is faster than paginating through all resources when looking for specific records.
 * Use the **List** endpoint (`GET /inquiries`) for simple listing with basic filters like reference ID.
 * ## Data Freshness
 * Do not use search for read-after-write flows because the data will not be immediately available to search.
 * Under normal operating conditions, data is searchable within approximately 1 minute of creation or modification.
 * Propagation of new or updated data could be delayed during an outage.
 * For workflows that require immediate data availability after creating or updating an inquiry, use the List Inquiries endpoint instead.
 * ### Searchable Attributes
 * The following attributes can be used in query predicates:
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const searchInquiries = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: SearchInquiriesInput,
  outputSchema: SearchInquiriesOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
