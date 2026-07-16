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
export interface ApproveAnInquiryInput {
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
  meta?: { comment?: string };
}
export const ApproveAnInquiryInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  inquiryId: Schema.String.pipe(T.PathParam()),
  include: Schema.optional(Schema.String).pipe(T.HttpQuery("include")),
  fields: Schema.optional(Schema.Record(Schema.String, Schema.String)).pipe(
    T.HttpQuery("fields", { style: "deepObject", explode: true }),
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
  meta: Schema.optional(
    Schema.Struct({
      comment: Schema.optional(Schema.String),
    }),
  ),
}).pipe(
  T.Http({ method: "POST", path: "/inquiries/{inquiryId}/approve" }),
) as unknown as Schema.Codec<ApproveAnInquiryInput>;

// Output Schema
export interface ApproveAnInquiryOutput {
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
export const ApproveAnInquiryOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
  {
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
  },
) as unknown as Schema.Codec<ApproveAnInquiryOutput>;

// The operation
/**
 * Approve an Inquiry
 *
 * Approves an Inquiry.
 * Note that this action will trigger any associated workflows and webhooks.
 * Approving an inquiry will prevent further progress on the inquiry.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const approveAnInquiry = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ApproveAnInquiryInput,
  outputSchema: ApproveAnInquiryOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
