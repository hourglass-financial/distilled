import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden } from "../errors.ts";

// Input Schema
export const ListAllInquiriesInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
  filter: Schema.optional(
    Schema.Struct({
      "inquiry-id": Schema.optional(Schema.String),
      "account-id": Schema.optional(Schema.String),
      note: Schema.optional(Schema.String),
      "reference-id": Schema.optional(Schema.String),
      "inquiry-template-id": Schema.optional(Schema.String),
      "template-id": Schema.optional(Schema.String),
      status: Schema.optional(Schema.String),
      "created-at-start": Schema.optional(Schema.String),
      "created-at-end": Schema.optional(Schema.String),
    }),
  ).pipe(T.HttpQuery("filter")),
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
}).pipe(T.Http({ method: "GET", path: "/inquiries" }));
export type ListAllInquiriesInput = typeof ListAllInquiriesInput.Type;

// Output Schema
export const ListAllInquiriesOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
  {
    data: Schema.Array(
      Schema.Struct({
        type: Schema.String,
        id: Schema.String,
        attributes: Schema.Struct({
          status: Schema.String,
          "reference-id": Schema.NullOr(Schema.String),
          note: Schema.NullOr(Schema.String),
          behaviors: Schema.NullOr(
            Schema.Record(Schema.String, Schema.Unknown),
          ),
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
  },
);
export type ListAllInquiriesOutput = typeof ListAllInquiriesOutput.Type;

// The operation
/**
 * List all Inquiries
 *
 * Returns a list of your organization's inquiries.
 * Note that this endpoint aggregates inquiries across all inquiry template(s). See [Pagination](https://docs.withpersona.com/pagination) for more details about handling the response. Results are returned in reverse chronological order, with the most recently created objects first.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const listAllInquiries = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListAllInquiriesInput,
  outputSchema: ListAllInquiriesOutput,
  errors: [BadRequest, Forbidden] as const,
}));
