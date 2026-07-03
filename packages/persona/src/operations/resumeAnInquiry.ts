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
import { SensitiveOutputString } from "../sensitive.ts";

// Input Schema
export const ResumeAnInquiryInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
}).pipe(T.Http({ method: "POST", path: "/inquiries/{inquiryId}/resume" }));
export type ResumeAnInquiryInput = typeof ResumeAnInquiryInput.Type;

// Output Schema
export const ResumeAnInquiryOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
  included: Schema.optional(Schema.Array(Schema.Unknown)),
  meta: Schema.Struct({
    "session-token": SensitiveOutputString,
  }),
});
export type ResumeAnInquiryOutput = typeof ResumeAnInquiryOutput.Type;

// The operation
/**
 * Resume an Inquiry
 *
 * Creates a session token that is returned as `meta.session-token`. If the inquiry's status is `expired`, changes the status to `pending`. The `session-token` must be included when loading the inquiry flow if the inquiry's status is `pending`.
 * This endpoint will error if the inquiry is redacted.
 * This endpoint first tries to reuse any existing valid unused [sessions](https://docs.withpersona.com/inquiry-sessions). If none exist, a new session is created.
 * For more information, see [Resuming Inquiries](https://docs.withpersona.com/resuming-inquiries).
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const resumeAnInquiry = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ResumeAnInquiryInput,
  outputSchema: ResumeAnInquiryOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
