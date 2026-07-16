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
export interface SearchInquiriesInput {
  fields?: Record<string, string>;
  page?: { after?: string; before?: string; size?: number };
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
  query?:
    | { and: ReadonlyArray<Record<string, unknown>> }
    | { or: ReadonlyArray<Record<string, unknown>> }
    | { not: Record<string, unknown> }
    | { attribute: string; operator: string; value: string | number | boolean };
  sort?: { attribute: string; direction: string };
}
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
  query: Schema.optional(
    Schema.Union([
      Schema.Struct({
        and: Schema.Array(Schema.Record(Schema.String, Schema.Unknown)),
      }),
      Schema.Struct({
        or: Schema.Array(Schema.Record(Schema.String, Schema.Unknown)),
      }),
      Schema.Struct({
        not: Schema.Record(Schema.String, Schema.Unknown),
      }),
      Schema.Struct({
        attribute: Schema.String,
        operator: Schema.String,
        value: Schema.Union([Schema.String, Schema.Number, Schema.Boolean]),
      }),
    ]),
  ),
  sort: Schema.optional(
    Schema.Struct({
      attribute: Schema.String,
      direction: Schema.String,
    }),
  ),
}).pipe(
  T.Http({ method: "POST", path: "/inquiries/search" }),
) as unknown as Schema.Codec<SearchInquiriesInput>;

// Output Schema
export interface SearchInquiriesOutput {
  data: ReadonlyArray<{
    type: string;
    id: string;
    attributes: {
      status: string;
      "reference-id": string | null;
      note: string | null;
      behaviors: Record<string, unknown> | null;
      tags: ReadonlyArray<string | null>;
      creator: string;
      "reviewer-comment": string | null;
      "created-at": string;
      "updated-at": string;
      "started-at": string | null;
      "expires-at": string | null;
      "completed-at": string | null;
      "failed-at": string | null;
      "marked-for-review-at": string | null;
      "decisioned-at": string | null;
      "expired-at": string | null;
      "redacted-at": string | null;
      "previous-step-name": string | null;
      "next-step-name": string | null;
      fields: Record<
        string,
        | { type: "string"; value: string | null }
        | { type: "choices"; value: string | null }
        | { type: "multi_choices"; value: ReadonlyArray<string> }
        | { type: "boolean"; value: boolean | null }
        | { type: "number"; value: number | null }
        | { type: "date"; value: string | null }
        | {
            type: "generic";
            value: { id: string; type: "Document::Generic" } | null;
          }
        | {
            type: "government_id";
            value: { id: string; type: "Document::GovernmentId" } | null;
          }
        | {
            type: "selfie";
            value: { id: string; type: "Selfie::ProfileAndCenter" } | null;
          }
        | { type: "json"; value: unknown }
      >;
    };
    relationships: {
      account?: { data?: { id?: string; type?: string } | null };
      documents?: { data?: ReadonlyArray<{ id?: string; type?: string }> };
      template?: { data?: { id?: string; type?: string } | null };
      "inquiry-template"?: { data?: { id?: string; type?: string } | null };
      "inquiry-template-version"?: {
        data?: { id?: string; type?: string } | null;
      };
      reports?: { data?: ReadonlyArray<{ id?: string; type?: string }> };
      transaction?: { data?: { id?: string; type?: string } | null };
      reviewer?: { data?: { id?: string; type?: string } | null };
      selfies?: { data?: ReadonlyArray<{ id?: string; type?: string }> };
      sessions?: { data?: ReadonlyArray<{ id?: string; type?: string }> };
      verifications?: { data?: ReadonlyArray<{ id?: string; type?: string }> };
    };
  }>;
  links: { prev: string | null; next: string | null };
}
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
        fields: Schema.Record(
          Schema.String,
          Schema.Union(
            [
              Schema.Struct({
                type: Schema.Literals(["string"]),
                value: Schema.NullOr(Schema.String),
              }),
              Schema.Struct({
                type: Schema.Literals(["choices"]),
                value: Schema.NullOr(Schema.String),
              }),
              Schema.Struct({
                type: Schema.Literals(["multi_choices"]),
                value: Schema.Array(Schema.String),
              }),
              Schema.Struct({
                type: Schema.Literals(["boolean"]),
                value: Schema.NullOr(Schema.Boolean),
              }),
              Schema.Struct({
                type: Schema.Literals(["number"]),
                value: Schema.NullOr(Schema.Number),
              }),
              Schema.Struct({
                type: Schema.Literals(["date"]),
                value: Schema.NullOr(Schema.String),
              }),
              Schema.Struct({
                type: Schema.Literals(["generic"]),
                value: Schema.NullOr(
                  Schema.Struct({
                    id: Schema.String,
                    type: Schema.Literals(["Document::Generic"]),
                  }),
                ),
              }),
              Schema.Struct({
                type: Schema.Literals(["government_id"]),
                value: Schema.NullOr(
                  Schema.Struct({
                    id: Schema.String,
                    type: Schema.Literals(["Document::GovernmentId"]),
                  }),
                ),
              }),
              Schema.Struct({
                type: Schema.Literals(["selfie"]),
                value: Schema.NullOr(
                  Schema.Struct({
                    id: Schema.String,
                    type: Schema.Literals(["Selfie::ProfileAndCenter"]),
                  }),
                ),
              }),
              Schema.Struct({
                type: Schema.Literals(["json"]),
                value: Schema.Unknown,
              }),
            ],
            { mode: "oneOf" },
          ),
        ),
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
}) as unknown as Schema.Codec<SearchInquiriesOutput>;

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
