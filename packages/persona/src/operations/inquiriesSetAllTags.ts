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
export const InquiriesSetAllTagsInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
    meta: Schema.optional(
      Schema.Struct({
        "tag-name": Schema.optional(Schema.Array(Schema.String)),
        "tag-id": Schema.optional(Schema.Array(Schema.String)),
      }),
    ),
  }).pipe(T.Http({ method: "POST", path: "/inquiries/{inquiryId}/set-tags" }));
export type InquiriesSetAllTagsInput = typeof InquiriesSetAllTagsInput.Type;

// Output Schema
export const InquiriesSetAllTagsOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
  });
export type InquiriesSetAllTagsOutput = typeof InquiriesSetAllTagsOutput.Type;

// The operation
/**
 * Set tags on an Inquiry
 *
 * Sets all tags on an Inquiry. Any tags that are not provided in the request will be removed.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const inquiriesSetAllTags = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: InquiriesSetAllTagsInput,
  outputSchema: InquiriesSetAllTagsOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
