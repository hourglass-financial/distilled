import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";

// Input Schema
export const ListDocumentsInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  page_size: Schema.optional(Schema.Number),
  starting_after: Schema.optional(Schema.String),
  ending_before: Schema.optional(Schema.String),
  program_id: Schema.optional(Schema.String),
  custom_ref: Schema.optional(Schema.String),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
}).pipe(T.Http({ method: "GET", path: "/documents" }));
export type ListDocumentsInput = typeof ListDocumentsInput.Type;

// Output Schema
export const ListDocumentsOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
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
    }),
  ),
  has_more: Schema.Boolean,
  page_size: Schema.Number,
  page_next: Schema.optional(Schema.NullOr(Schema.String)),
  page_prev: Schema.optional(Schema.NullOr(Schema.String)),
  url: Schema.String,
});
export type ListDocumentsOutput = typeof ListDocumentsOutput.Type;

// The operation
/**
 * List Documents
 *
 * Retrieve a list of Documents
 *
 * @param page_size - Number of items per page (max 100)
 * @param starting_after - Cursor for pagination (exclusive start)
 * @param ending_before - Cursor for pagination (exclusive end)
 * @param program_id - Filter by program ID
 * @param custom_ref - Filter by exact `custom_ref` match (case-sensitive, up to 255 characters).
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const listDocuments = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListDocumentsInput,
  outputSchema: ListDocumentsOutput,
}));
