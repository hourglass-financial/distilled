import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { StructWithAdditionalProperties } from "@distilled.cloud/core/openapi/additional-properties";
import {
  BadRequest,
  Forbidden,
  NotFound,
  Conflict,
  UnprocessableEntity,
} from "../errors.ts";

// Input Schema
export interface UpdateAnInquiryInput {
  inquiryId: string;
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
  data?: {
    attributes?: {
      note?: string | null;
      fields?:
        | ({
            birthdate?: string | null;
            "email-address"?: string | null;
            "name-first"?: string | null;
            "name-last"?: string | null;
            "name-middle"?: string | null;
            "phone-number"?: string | null;
            "address-city"?: string | null;
            "address-country-code"?: string | null;
            "address-postal-code"?: string | null;
            "address-street-1"?: string | null;
            "address-street-2"?: string | null;
            "address-subdivision"?: string | null;
          } & Record<
            string,
            | string
            | number
            | boolean
            | ReadonlyArray<unknown>
            | Record<string, unknown>
            | null
            | string
            | null
          >)
        | null;
      tags?: ReadonlyArray<string>;
      "redirect-uri"?: string | null;
    };
  };
}
export const UpdateAnInquiryInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  inquiryId: Schema.String.pipe(T.PathParam()),
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
  data: Schema.optional(
    Schema.Struct({
      attributes: Schema.optional(
        Schema.Struct({
          note: Schema.optional(Schema.NullOr(Schema.String)),
          fields: Schema.optional(
            Schema.NullOr(
              StructWithAdditionalProperties(
                Schema.Struct({
                  birthdate: Schema.optional(Schema.NullOr(Schema.String)),
                  "email-address": Schema.optional(
                    Schema.NullOr(Schema.String),
                  ),
                  "name-first": Schema.optional(Schema.NullOr(Schema.String)),
                  "name-last": Schema.optional(Schema.NullOr(Schema.String)),
                  "name-middle": Schema.optional(Schema.NullOr(Schema.String)),
                  "phone-number": Schema.optional(Schema.NullOr(Schema.String)),
                  "address-city": Schema.optional(Schema.NullOr(Schema.String)),
                  "address-country-code": Schema.optional(
                    Schema.NullOr(Schema.String),
                  ),
                  "address-postal-code": Schema.optional(
                    Schema.NullOr(Schema.String),
                  ),
                  "address-street-1": Schema.optional(
                    Schema.NullOr(Schema.String),
                  ),
                  "address-street-2": Schema.optional(
                    Schema.NullOr(Schema.String),
                  ),
                  "address-subdivision": Schema.optional(
                    Schema.NullOr(Schema.String),
                  ),
                }),
                Schema.NullOr(
                  Schema.Union([
                    Schema.String,
                    Schema.Number,
                    Schema.Boolean,
                    Schema.Array(Schema.Unknown),
                    Schema.Record(Schema.String, Schema.Unknown),
                  ]),
                ),
              ),
            ),
          ),
          tags: Schema.optional(Schema.Array(Schema.String)),
          "redirect-uri": Schema.optional(Schema.NullOr(Schema.String)),
        }),
      ),
    }),
  ),
}).pipe(
  T.Http({ method: "PATCH", path: "/inquiries/{inquiryId}" }),
) as unknown as Schema.Codec<UpdateAnInquiryInput>;

// Output Schema
export interface UpdateAnInquiryOutput {
  data: {
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
  };
  included?: ReadonlyArray<unknown>;
}
export const UpdateAnInquiryOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Struct({
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
  included: Schema.optional(Schema.Array(Schema.Unknown)),
}) as unknown as Schema.Codec<UpdateAnInquiryOutput>;

// The operation
/**
 * Update an Inquiry
 *
 * Updates an existing Inquiry.
 * Note that if you use webhooks, updates to inquiries that are not in progress can result in data getting out of sync. For example, updating a completed Inquiry will not cause your Inquiry completed webhook to retrigger.
 * Inquiries represent a snapshot of data collected from an individual, so we generally do not recommend updating an Inquiry's data after the Inquiry has been finalized.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const updateAnInquiry = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateAnInquiryInput,
  outputSchema: UpdateAnInquiryOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
