import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest } from "../errors.ts";

// Input Schema
export const CreateDocumentInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Idempotency-Key"),
  ),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
  file: Schema.String,
  document_type: Schema.Literals([
    "US_DRIVERS_LICENSE",
    "PASSPORT",
    "FORMATION_DOCUMENT",
    "IRS_EIN_CONFIRMATION",
    "OTHER",
  ]),
  name: Schema.String,
  description: Schema.optional(Schema.String),
  program_id: Schema.String,
  custom_ref: Schema.optional(Schema.String),
  custom_fields: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
}).pipe(
  T.Http({ method: "POST", path: "/documents", contentType: "multipart" }),
);
export type CreateDocumentInput = typeof CreateDocumentInput.Type;

// Output Schema
export const CreateDocumentOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
export type CreateDocumentOutput = typeof CreateDocumentOutput.Type;

// The operation
/**
 * Upload Document
 *
 * Upload a document for Onboarding verification
 *
 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 * @param Erebor-Version - Optional API version header. Use a date-based Erebor API version when you need to pin request behavior.
 */
export const createDocument = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateDocumentInput,
  outputSchema: CreateDocumentOutput,
  errors: [BadRequest] as const,
}));
