import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound, Conflict } from "../errors.ts";

// Input Schema
export const UpdateDocumentInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String.pipe(T.PathParam()),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
  ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Idempotency-Key"),
  ),
  custom_ref: Schema.optional(Schema.String),
  custom_fields: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
}).pipe(T.Http({ method: "PATCH", path: "/documents/{id}" }));
export type UpdateDocumentInput = typeof UpdateDocumentInput.Type;

// Output Schema
export const UpdateDocumentOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String,
  type: Schema.Literals(["DOCUMENT"]),
  url: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  archived_at: Schema.optional(Schema.NullOr(Schema.String)),
  program_id: Schema.String,
  name: Schema.String,
  description: Schema.optional(Schema.NullOr(Schema.String)),
  document_type: Schema.Literals([
    "US_DRIVERS_LICENSE",
    "PASSPORT",
    "FORMATION_DOCUMENT",
    "IRS_EIN_CONFIRMATION",
    "OTHER",
  ]),
  content_hash: Schema.String,
  content_size: Schema.Number,
  content_type: Schema.String,
  content_url: Schema.String,
  custom_ref: Schema.optional(Schema.Unknown),
  custom_fields: Schema.optional(Schema.Unknown),
});
export type UpdateDocumentOutput = typeof UpdateDocumentOutput.Type;

// The operation
/**
 * Update Document
 *
 * Update a document's `custom_ref` or `custom_fields`. The file contents, name, type, and description are immutable.
 *
 * @param id - Document ID
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const updateDocument = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateDocumentInput,
  outputSchema: UpdateDocumentOutput,
  errors: [BadRequest, NotFound, Conflict] as const,
}));
