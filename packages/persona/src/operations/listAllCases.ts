import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface ListAllCasesInput {
  page?: { after?: string; before?: string; size?: number };
  fields?: Record<string, string>;
  filter?: {
    status?: string;
    "case-template-id"?: string;
    "account-id"?: string;
    "reference-id"?: string;
    "inquiry-id"?: string;
    "report-id"?: string;
  };
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
export const ListAllCasesInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  page: Schema.optional(
    Schema.Struct({
      after: Schema.optional(Schema.String),
      before: Schema.optional(Schema.String),
      size: Schema.optional(Schema.Number),
    }),
  ),
  fields: Schema.optional(Schema.Record(Schema.String, Schema.String)).pipe(
    T.HttpQuery("fields"),
  ),
  filter: Schema.optional(
    Schema.Struct({
      status: Schema.optional(Schema.String),
      "case-template-id": Schema.optional(Schema.String),
      "account-id": Schema.optional(Schema.String),
      "reference-id": Schema.optional(Schema.String),
      "inquiry-id": Schema.optional(Schema.String),
      "report-id": Schema.optional(Schema.String),
    }),
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
  T.Http({ method: "GET", path: "/cases" }),
) as unknown as Schema.Codec<ListAllCasesInput>;

// Output Schema
export interface ListAllCasesOutput {
  data: ReadonlyArray<{
    type?: string;
    id?: string;
    attributes?: {
      status?: string;
      name?: string;
      resolution?: string | null;
      "created-at"?: string;
      "updated-at"?: string | null;
      "assigned-at"?: string | null;
      "resolved-at"?: string | null;
      "redacted-at"?: string | null;
      "sla-expires-at"?: string | null;
      "creator-id"?: string | null;
      "creator-type"?: string | null;
      "assignee-id"?: string | null;
      "assigner-id"?: string | null;
      "assigner-type"?: string | null;
      "resolver-id"?: string | null;
      "resolver-type"?: string | null;
      "updater-id"?: string | null;
      "updater-type"?: string | null;
      tags?: ReadonlyArray<unknown>;
      fields?: Record<string, unknown>;
      attachments?: ReadonlyArray<{
        filename?: string;
        url?: string;
        "byte-size"?: number;
      }>;
    };
    relationships?: {
      accounts?: { data?: ReadonlyArray<{ id?: string; type?: string }> };
      "case-comments"?: {
        data?: ReadonlyArray<{ id?: string; type?: string }>;
      };
      "case-template"?: { data?: { id?: string; type?: string } };
      "case-queue"?: { data?: { id?: string; type?: string } | null };
      inquiries?: { data?: ReadonlyArray<{ id?: string; type?: string }> };
      reports?: { data?: ReadonlyArray<{ id?: string; type?: string }> };
      verifications?: { data?: ReadonlyArray<{ id?: string; type?: string }> };
      txns?: { data?: ReadonlyArray<{ id?: string; type?: string }> };
    };
  }>;
  links: { next: string | null; prev: string | null };
}
export const ListAllCasesOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
    next: Schema.NullOr(Schema.String),
    prev: Schema.NullOr(Schema.String),
  }),
}) as unknown as Schema.Codec<ListAllCasesOutput>;

// The operation
/**
 * List all Cases
 *
 * Returns a list of your organization's cases.
 * Note that this endpoint aggregates cases across all case template(s). See [Pagination](https://docs.withpersona.com/pagination)for more details about handling the response. Results are returned in reverse chronological order, with the most recently created objects first.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const listAllCases = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListAllCasesInput,
  outputSchema: ListAllCasesOutput,
  errors: [BadRequest, Forbidden, NotFound] as const,
}));
