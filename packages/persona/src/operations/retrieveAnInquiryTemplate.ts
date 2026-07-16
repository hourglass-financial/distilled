import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface RetrieveAnInquiryTemplateInput {
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
}
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
  ) as unknown as Schema.Codec<RetrieveAnInquiryTemplateInput>;

// Output Schema
export interface RetrieveAnInquiryTemplateOutput {
  data: {
    type?: string;
    id?: string;
    attributes?: {
      name?: string;
      status?: string;
      "embedded-flow-domain-allowlist"?: ReadonlyArray<string>;
      "hosted-flow-subdomains"?: ReadonlyArray<string>;
      "hosted-flow-redirect-uri-schemes"?: ReadonlyArray<string>;
      "field-schemas"?: ReadonlyArray<
        | {
            type?: string;
            key?: string;
            label?: string | null;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
              "item-schema"?: unknown;
            };
          }
        | {
            type?: string;
            key?: string;
            label?: string | null;
            "default-value"?: boolean | null;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
            };
          }
        | {
            type?: string;
            key?: string;
            label?: string | null;
            "default-value"?: string | null;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
              "allow-empty"?: boolean;
              options?: ReadonlyArray<string>;
              "option-labels"?: ReadonlyArray<string>;
            };
          }
        | {
            type?: string;
            key?: string;
            label?: string | null;
            "default-value"?: string | null;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
              "min-date"?: string | null;
              "max-date"?: string | null;
            };
          }
        | {
            type?: string;
            key?: string;
            label?: string | null;
            "default-value"?: string | null;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
            };
          }
        | {
            type?: string;
            key?: string;
            label?: string | null;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
              "max-file-size-bytes"?: number;
              "min-file-size-bytes"?: number;
              "supported-mime-types"?: ReadonlyArray<string>;
              "page-count-limit-enabled"?: boolean;
              "page-count-min"?: number | null;
              "page-count-max"?: number | null;
            };
          }
        | {
            type?: string;
            key?: string;
            label?: string | null;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
              "ignore-unknown-keys"?: boolean;
              "item-schemas"?: ReadonlyArray<unknown>;
            };
          }
        | {
            type?: string;
            key?: string;
            label?: string | null;
            "default-value"?: number | null;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
              min?: number;
              max?: number;
            };
          }
        | {
            type?: string;
            key?: string;
            label?: string | null;
            "default-value"?: unknown;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
              "json-schema"?: Record<string, unknown>;
            };
          }
        | {
            type?: string;
            key?: string;
            label?: string | null;
            "default-value"?: ReadonlyArray<string> | null;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
              "allow-empty"?: boolean;
              options?: ReadonlyArray<string>;
              "option-labels"?: ReadonlyArray<string>;
            };
          }
        | {
            type?: string;
            key?: string;
            label?: string | null;
            "default-value"?: string | null;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
              "max-char-length"?: number;
              sanitize?: ReadonlyArray<string>;
            };
          }
        | {
            type?: string;
            key?: string;
            label?: string | null;
            config?: {
              required?: boolean;
              "archived-at"?: string | null;
              "deactivated-at"?: string | null;
              "source-key-path"?: string | null;
              "redaction-policy"?: string;
              "write-policy"?: string;
              target?: string;
            };
          }
      >;
    };
    relationships?: {
      "latest-published-version"?: {
        data?: { type?: string; id?: string } | null;
      };
    };
  };
  included?: ReadonlyArray<{
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
  }>;
}
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
  }) as unknown as Schema.Codec<RetrieveAnInquiryTemplateOutput>;

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
