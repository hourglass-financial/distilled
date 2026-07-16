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
export interface ImportInquiryTemplateTranslationsInput {
  inquiryTemplateId: string;
  include?: string;
  fields?: Record<string, string>;
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
  data: {
    attributes: {
      translations: ReadonlyArray<{
        step: string;
        "step-display-name"?: string;
        component: string;
        "attribute-name": string;
        "locale-values": ReadonlyArray<{
          locale: string;
          value: string | null;
        }>;
      }>;
    };
  };
}
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
  ) as unknown as Schema.Codec<ImportInquiryTemplateTranslationsInput>;

// Output Schema
export interface ImportInquiryTemplateTranslationsOutput {
  data: {
    type?: string;
    id?: string;
    attributes?: {
      "name-display"?: string | null;
      status?: string;
      "enabled-locales"?: ReadonlyArray<string>;
      "created-at"?: string;
      "updated-at"?: string | null;
      "published-at"?: string | null;
      theme?: {
        "border-radius"?: string | null;
        "border-radius-input"?: string | null;
        "border-radius-modal"?: string | null;
        "border-width"?: string | null;
        "border-width-input"?: string | null;
        "button-background-image"?: string | null;
        "button-font-weight"?: string | null;
        "button-position"?: string | null;
        "button-shadow-strength"?: string | null;
        "button-text-transform"?: string | null;
        "color-button-primary"?: string | null;
        "color-button-secondary"?: string | null;
        "color-button-secondary-fill"?: string | null;
        "color-button-primary-fill-disabled"?: string | null;
        "color-button-secondary-fill-disabled"?: string | null;
        "color-error"?: string | null;
        "color-font"?: string | null;
        "color-font-button-primary"?: string | null;
        "color-font-button-secondary"?: string | null;
        "color-font-small"?: string | null;
        "color-font-title"?: string | null;
        "color-icon-header"?: string | null;
        "color-input-background"?: string | null;
        "color-input-border"?: string | null;
        "color-link"?: string | null;
        "color-modal-background"?: string | null;
        "color-primary"?: string | null;
        "color-progress-bar"?: string | null;
        "color-success"?: string | null;
        "color-warning"?: string | null;
        "color-divider"?: string | null;
        "color-dropdown-background"?: string | null;
        "color-dropdown-option"?: string | null;
        "font-family"?: string | null;
        "font-family-title"?: string | null;
        "font-url"?: string | null;
        "font-size-body"?: string | null;
        "font-size-header"?: string | null;
        "font-size-small"?: string | null;
        "line-height-body"?: string | null;
        "line-height-header"?: string | null;
        "line-height-small"?: string | null;
        "header-font-weight"?: string | null;
        "header-margin-bottom"?: string | null;
        "icon-color-primary"?: string | null;
        "icon-color-highlight"?: string | null;
        "icon-color-stroke"?: string | null;
        "icon-color-background"?: string | null;
        "icon-color-government-id-type"?: string | null;
        "icon-style"?: string | null;
        "input-style"?: string | null;
        "page-transition"?: string | null;
        "text-align"?: string | null;
        "text-decoration-line-link"?: string | null;
        "us-state-input-method"?: string | null;
        "vertical-options-style"?: string | null;
        "government-id-pictograph-position"?: string | null;
        "id-back-pictograph-height"?: string | null;
        "id-back-pictograph-url"?: string | null;
        "id-front-pictograph-height"?: string | null;
        "id-front-pictograph-url"?: string | null;
        "passport-front-pictograph-height"?: string | null;
        "passport-front-pictograph-url"?: string | null;
        "passport-signature-pictograph-height"?: string | null;
        "passport-signature-pictograph-url"?: string | null;
        "government-id-select-pictograph-height"?: string | null;
        "government-id-select-pictograph-url"?: string | null;
        "device-handoff-terms-text-position"?: string | null;
        "selfie-pictograph-url"?: string | null;
        "selfie-pictograph-height"?: string | null;
        "selfie-center-pictograph-url"?: string | null;
        "selfie-center-pictograph-height"?: string | null;
        "selfie-left-pictograph-url"?: string | null;
        "selfie-left-pictograph-height"?: string | null;
        "selfie-right-pictograph-url"?: string | null;
        "selfie-right-pictograph-height"?: string | null;
        "document-pictograph-position"?: string | null;
        "document-pictograph-height"?: string | null;
        "document-pictograph-url"?: string | null;
        "camera-support-pictograph-height"?: string | null;
        "camera-support-pictograph-url"?: string | null;
        "loading-pictograph-height"?: string | null;
        "loading-pictograph-url"?: string | null;
        "navbar-logo-display"?: string | null;
        "logo-url"?: string | null;
        logo?: string | null;
        "logo-data"?: string | null;
        "logo-filename"?: string | null;
      };
    };
    relationships?: {
      "inquiry-template"?: { data?: { type?: string; id?: string } };
    };
  };
}
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
  }) as unknown as Schema.Codec<ImportInquiryTemplateTranslationsOutput>;

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
