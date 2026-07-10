import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export const RetrieveAnInquiryTemplateInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    inquiryTemplateId: Schema.String.pipe(T.PathParam()),
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
  }).pipe(
    T.Http({ method: "GET", path: "/inquiry-templates/{inquiryTemplateId}" }),
  );
export type RetrieveAnInquiryTemplateInput =
  typeof RetrieveAnInquiryTemplateInput.Type;

// Output Schema
export const RetrieveAnInquiryTemplateOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Struct({
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
    included: Schema.optional(Schema.Array(Schema.Unknown)),
  });
export type RetrieveAnInquiryTemplateOutput =
  typeof RetrieveAnInquiryTemplateOutput.Type;

// The operation
/**
 * Retrieve an Inquiry Template
 *
 * Retrieves details of a specific Inquiry Template by ID.
 * Note: You must use a production API key to access this endpoint. For security reasons, we do not expose organization-level resources like Inquiry Templates in Sandbox via API.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 * @param inquiryTemplateId - Inquiry Template ID
 */
export const retrieveAnInquiryTemplate = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: RetrieveAnInquiryTemplateInput,
    outputSchema: RetrieveAnInquiryTemplateOutput,
    errors: [BadRequest, Forbidden, NotFound] as const,
  }),
);
