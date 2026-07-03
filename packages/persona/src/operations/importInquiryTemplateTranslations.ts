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
export const ImportInquiryTemplateTranslationsInput =
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
    data: Schema.Struct({
      attributes: Schema.Struct({
        translations: Schema.Array(
          Schema.Struct({
            step: Schema.String,
            "step-display-name": Schema.optional(Schema.String),
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
  }).pipe(
    T.Http({
      method: "POST",
      path: "/inquiry-templates/{inquiryTemplateId}/translations",
    }),
  );
export type ImportInquiryTemplateTranslationsInput =
  typeof ImportInquiryTemplateTranslationsInput.Type;

// Output Schema
export const ImportInquiryTemplateTranslationsOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Struct({
      type: Schema.optional(Schema.String),
      id: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          "name-display": Schema.optional(Schema.NullOr(Schema.String)),
          status: Schema.optional(Schema.String),
          "enabled-locales": Schema.optional(Schema.Array(Schema.String)),
          "created-at": Schema.optional(Schema.String),
          "updated-at": Schema.optional(Schema.NullOr(Schema.String)),
          "published-at": Schema.optional(Schema.NullOr(Schema.String)),
          theme: Schema.optional(
            Schema.Struct({
              "border-radius": Schema.optional(Schema.NullOr(Schema.String)),
              "border-radius-input": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "border-radius-modal": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "border-width": Schema.optional(Schema.NullOr(Schema.String)),
              "border-width-input": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "button-background-image": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "button-font-weight": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "button-position": Schema.optional(Schema.NullOr(Schema.String)),
              "button-shadow-strength": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "button-text-transform": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "color-button-primary": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "color-button-secondary": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "color-button-secondary-fill": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "color-button-primary-fill-disabled": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "color-button-secondary-fill-disabled": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "color-error": Schema.optional(Schema.NullOr(Schema.String)),
              "color-font": Schema.optional(Schema.NullOr(Schema.String)),
              "color-font-button-primary": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "color-font-button-secondary": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "color-font-small": Schema.optional(Schema.NullOr(Schema.String)),
              "color-font-title": Schema.optional(Schema.NullOr(Schema.String)),
              "color-icon-header": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "color-input-background": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "color-input-border": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "color-link": Schema.optional(Schema.NullOr(Schema.String)),
              "color-modal-background": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "color-primary": Schema.optional(Schema.NullOr(Schema.String)),
              "color-progress-bar": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "color-success": Schema.optional(Schema.NullOr(Schema.String)),
              "color-warning": Schema.optional(Schema.NullOr(Schema.String)),
              "color-divider": Schema.optional(Schema.NullOr(Schema.String)),
              "color-dropdown-background": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "color-dropdown-option": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "font-family": Schema.optional(Schema.NullOr(Schema.String)),
              "font-family-title": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "font-url": Schema.optional(Schema.NullOr(Schema.String)),
              "font-size-body": Schema.optional(Schema.NullOr(Schema.String)),
              "font-size-header": Schema.optional(Schema.NullOr(Schema.String)),
              "font-size-small": Schema.optional(Schema.NullOr(Schema.String)),
              "line-height-body": Schema.optional(Schema.NullOr(Schema.String)),
              "line-height-header": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "line-height-small": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "header-font-weight": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "header-margin-bottom": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "icon-color-primary": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "icon-color-highlight": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "icon-color-stroke": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "icon-color-background": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "icon-color-government-id-type": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "icon-style": Schema.optional(Schema.NullOr(Schema.String)),
              "input-style": Schema.optional(Schema.NullOr(Schema.String)),
              "page-transition": Schema.optional(Schema.NullOr(Schema.String)),
              "text-align": Schema.optional(Schema.NullOr(Schema.String)),
              "text-decoration-line-link": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "us-state-input-method": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "vertical-options-style": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "government-id-pictograph-position": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "id-back-pictograph-height": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "id-back-pictograph-url": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "id-front-pictograph-height": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "id-front-pictograph-url": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "passport-front-pictograph-height": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "passport-front-pictograph-url": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "passport-signature-pictograph-height": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "passport-signature-pictograph-url": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "government-id-select-pictograph-height": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "government-id-select-pictograph-url": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "device-handoff-terms-text-position": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "selfie-pictograph-url": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "selfie-pictograph-height": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "selfie-center-pictograph-url": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "selfie-center-pictograph-height": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "selfie-left-pictograph-url": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "selfie-left-pictograph-height": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "selfie-right-pictograph-url": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "selfie-right-pictograph-height": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "document-pictograph-position": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "document-pictograph-height": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "document-pictograph-url": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "camera-support-pictograph-height": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "camera-support-pictograph-url": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "loading-pictograph-height": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "loading-pictograph-url": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "navbar-logo-display": Schema.optional(
                Schema.NullOr(Schema.String),
              ),
              "logo-url": Schema.optional(Schema.NullOr(Schema.String)),
              logo: Schema.optional(Schema.NullOr(Schema.String)),
              "logo-data": Schema.optional(Schema.NullOr(Schema.String)),
              "logo-filename": Schema.optional(Schema.NullOr(Schema.String)),
            }),
          ),
        }),
      ),
      relationships: Schema.optional(
        Schema.Struct({
          "inquiry-template": Schema.optional(
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
  });
export type ImportInquiryTemplateTranslationsOutput =
  typeof ImportInquiryTemplateTranslationsOutput.Type;

// The operation
/**
 * Import Inquiry Template Translations
 *
 * Imports translations for an Inquiry Template. Supports partial updates — translation rows not included in the request body are left unchanged.
 * If a draft version already exists, translations are applied to it. If no draft exists, a new draft is created from the latest published version before importing. The draft is never automatically published — publishing is always a manual step in the dashboard.
 * Note: You must use a production API key to access this endpoint. For security reasons, we do not expose organization-level resources like Inquiry Templates in Sandbox via API.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 * @param inquiryTemplateId - Inquiry Template ID
 */
export const importInquiryTemplateTranslations =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: ImportInquiryTemplateTranslationsInput,
    outputSchema: ImportInquiryTemplateTranslationsOutput,
    errors: [
      BadRequest,
      Forbidden,
      NotFound,
      Conflict,
      UnprocessableEntity,
    ] as const,
  }));
