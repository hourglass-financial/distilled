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
import { SensitiveOutputNullableString } from "../sensitive.ts";
import * as Redacted from "effect/Redacted";

// Input Schema
export interface CreateAnInquiryInput {
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
      "template-id"?: string | null;
      "inquiry-template-id"?: string | null;
      "inquiry-template-version-id"?: string | null;
      "reference-id"?: string | null;
      "account-id"?: string | null;
      "creator-email-address"?: string | null;
      "theme-id"?: string | null;
      "theme-set-id"?: string | null;
      "redirect-uri"?: string | null;
      note?: string | null;
      fields?: { "address-country-code"?: string } | null;
      tags?: ReadonlyArray<string> | null;
      "initial-step-name"?: string | null;
    };
  };
  meta?: {
    "auto-create-account"?: boolean;
    "auto-create-account-type-id"?: string;
    "auto-create-account-reference-id"?: string;
    "auto-create-inquiry-session"?: boolean;
    "auto-create-one-time-link"?: boolean;
    "expiration-after-create-interval-seconds"?: number | null;
    "expiration-after-start-interval-seconds"?: number | null;
    "expiration-after-resume-interval-seconds"?: number | null;
    "one-time-link-expiration-seconds"?: number | null;
  };
}
export const CreateAnInquiryInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
      "template-id": Schema.optional(Schema.NullOr(Schema.String)),
      "inquiry-template-id": Schema.optional(Schema.NullOr(Schema.String)),
      "inquiry-template-version-id": Schema.optional(
        Schema.NullOr(Schema.String),
      ),
      "reference-id": Schema.optional(Schema.NullOr(Schema.String)),
      "account-id": Schema.optional(Schema.NullOr(Schema.String)),
      "creator-email-address": Schema.optional(Schema.NullOr(Schema.String)),
      "theme-id": Schema.optional(Schema.NullOr(Schema.String)),
      "theme-set-id": Schema.optional(Schema.NullOr(Schema.String)),
      "redirect-uri": Schema.optional(Schema.NullOr(Schema.String)),
      note: Schema.optional(Schema.NullOr(Schema.String)),
      fields: Schema.optional(
        Schema.NullOr(
          Schema.Struct({
            "address-country-code": Schema.optional(Schema.String),
          }),
        ),
      ),
      tags: Schema.optional(Schema.NullOr(Schema.Array(Schema.String))),
      "initial-step-name": Schema.optional(Schema.NullOr(Schema.String)),
    }),
  }),
  meta: Schema.optional(
    Schema.Struct({
      "auto-create-account": Schema.optional(Schema.Boolean),
      "auto-create-account-type-id": Schema.optional(Schema.String),
      "auto-create-account-reference-id": Schema.optional(Schema.String),
      "auto-create-inquiry-session": Schema.optional(Schema.Boolean),
      "auto-create-one-time-link": Schema.optional(Schema.Boolean),
      "expiration-after-create-interval-seconds": Schema.optional(
        Schema.NullOr(Schema.Number),
      ),
      "expiration-after-start-interval-seconds": Schema.optional(
        Schema.NullOr(Schema.Number),
      ),
      "expiration-after-resume-interval-seconds": Schema.optional(
        Schema.NullOr(Schema.Number),
      ),
      "one-time-link-expiration-seconds": Schema.optional(
        Schema.NullOr(Schema.Number),
      ),
    }),
  ),
}).pipe(
  T.Http({ method: "POST", path: "/inquiries" }),
) as unknown as Schema.Codec<CreateAnInquiryInput>;

// Output Schema
export interface CreateAnInquiryOutput {
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
  meta: {
    "session-token": Redacted.Redacted<string> | null;
    "one-time-link": string | null;
    "one-time-link-short": string | null;
  };
}
export const CreateAnInquiryOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
  meta: Schema.Struct({
    "session-token": SensitiveOutputNullableString,
    "one-time-link": Schema.NullOr(Schema.String),
    "one-time-link-short": Schema.NullOr(Schema.String),
  }),
}) as unknown as Schema.Codec<CreateAnInquiryOutput>;

// The operation
/**
 * Create an Inquiry
 *
 * Creates a new inquiry with optional pre-filled attributes.
 * See [Sessions](https://docs.withpersona.com/inquiry-sessions) for how to continue the inquiry in [Embedded Flow](https://docs.withpersona.com/embedded-flow) or [Hosted Flow](https://docs.withpersona.com/hosted-flow).
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const createAnInquiry = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateAnInquiryInput,
  outputSchema: CreateAnInquiryOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
