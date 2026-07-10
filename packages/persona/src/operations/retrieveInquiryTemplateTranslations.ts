import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export const RetrieveInquiryTemplateTranslationsInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    inquiryTemplateId: Schema.String.pipe(T.PathParam()),
    include: Schema.optional(Schema.String).pipe(T.HttpQuery("include")),
    fields: Schema.optional(Schema.Record(Schema.String, Schema.String)).pipe(
      T.HttpQuery("fields"),
    ),
    keyInflection: Schema.optional(
      Schema.Literals(["camel", "kebab", "snake"]),
    ).pipe(T.HttpHeader("Key-Inflection")),
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
      method: "GET",
      path: "/inquiry-templates/{inquiryTemplateId}/translations",
    }),
  );
export type RetrieveInquiryTemplateTranslationsInput =
  typeof RetrieveInquiryTemplateTranslationsInput.Type;

// Output Schema
export const RetrieveInquiryTemplateTranslationsOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Struct({
      type: Schema.String,
      id: Schema.String,
      attributes: Schema.Struct({
        translations: Schema.Array(
          Schema.Struct({
            step: Schema.String,
            "step-display-name": Schema.String,
            component: Schema.String,
            "attribute-name": Schema.String,
            "locale-values": Schema.Array(
              Schema.Struct({
                locale: Schema.String,
                value: Schema.NullOr(Schema.String),
              }),
            ),
          }),
        ),
      }),
    }),
  });
export type RetrieveInquiryTemplateTranslationsOutput =
  typeof RetrieveInquiryTemplateTranslationsOutput.Type;

// The operation
/**
 * Retrieve Inquiry Template Translations
 *
 * Retrieves the translations for an Inquiry Template as a JSON:API resource.
 * The export uses the latest draft version if one exists, otherwise falls back to the latest published version.
 * Note: You must use a production API key to access this endpoint. For security reasons, we do not expose organization-level resources like Inquiry Templates in Sandbox via API.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 * @param inquiryTemplateId - Inquiry Template ID
 */
export const retrieveInquiryTemplateTranslations =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: RetrieveInquiryTemplateTranslationsInput,
    outputSchema: RetrieveInquiryTemplateTranslationsOutput,
    errors: [BadRequest, Forbidden, NotFound] as const,
  }));
