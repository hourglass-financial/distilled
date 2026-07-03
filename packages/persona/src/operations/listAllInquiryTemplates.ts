import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden } from "../errors.ts";

// Input Schema
export const ListAllInquiryTemplatesInput =
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
  }).pipe(T.Http({ method: "GET", path: "/inquiry-templates" }));
export type ListAllInquiryTemplatesInput =
  typeof ListAllInquiryTemplatesInput.Type;

// Output Schema
export const ListAllInquiryTemplatesOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
        type: Schema.optional(Schema.String),
        id: Schema.optional(Schema.String),
        attributes: Schema.optional(
          Schema.Struct({
            name: Schema.optional(Schema.String),
            status: Schema.optional(Schema.String),
            "embedded-flow-domain-allowlist": Schema.optional(
              Schema.Array(Schema.String),
            ),
            "hosted-flow-subdomains": Schema.optional(
              Schema.Array(Schema.String),
            ),
            "hosted-flow-redirect-uri-schemes": Schema.optional(
              Schema.Array(Schema.String),
            ),
            "field-schemas": Schema.optional(Schema.Array(Schema.Unknown)),
          }),
        ),
        relationships: Schema.optional(
          Schema.Struct({
            "latest-published-version": Schema.optional(
              Schema.Struct({
                data: Schema.optional(
                  Schema.NullOr(
                    Schema.Struct({
                      type: Schema.optional(Schema.String),
                      id: Schema.optional(Schema.String),
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
export type ListAllInquiryTemplatesOutput =
  typeof ListAllInquiryTemplatesOutput.Type;

// The operation
/**
 * List all Inquiry Templates
 *
 * Retrieves a list of your organization's Inquiry Templates.
 * Note: You must use a production API key to access this endpoint. For security reasons, we do not expose organization-level resources like Inquiry Templates in Sandbox via API. Results are returned in reverse chronological order, with the most recently created objects first.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const listAllInquiryTemplates = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: ListAllInquiryTemplatesInput,
    outputSchema: ListAllInquiryTemplatesOutput,
    errors: [BadRequest, Forbidden] as const,
  }),
);
