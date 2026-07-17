import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";

// Input Schema
export interface ListDocumentsInput {
  page_size?: number;
  starting_after?: string;
  ending_before?: string;
  program_id?: string;
  custom_ref?: string;
  ereborVersion?: string;
}
export const ListDocumentsInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  page_size: Schema.optional(Schema.Number).pipe(T.HttpQuery("page_size")),
  starting_after: Schema.optional(Schema.String).pipe(
    T.HttpQuery("starting_after"),
  ),
  ending_before: Schema.optional(Schema.String).pipe(
    T.HttpQuery("ending_before"),
  ),
  program_id: Schema.optional(Schema.String).pipe(T.HttpQuery("program_id")),
  custom_ref: Schema.optional(Schema.String).pipe(T.HttpQuery("custom_ref")),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
}).pipe(
  T.Http({ method: "GET", path: "/documents" }),
) as unknown as GeneratedStructCodec<ListDocumentsInput>;

// Output Schema
export interface ListDocumentsOutput {
  data: ReadonlyArray<{
    id: string;
    type: "DOCUMENT";
    url: string;
    created_at: string;
    updated_at: string;
    archived_at?: string | null;
    program_id: string;
    name: string;
    description?: string | null;
    document_type:
      | "US_DRIVERS_LICENSE"
      | "PASSPORT"
      | "FORMATION_DOCUMENT"
      | "IRS_EIN_CONFIRMATION"
      | "OTHER";
    content_hash: string;
    content_size: number;
    content_type: string;
    content_url: string;
    custom_ref?: string | null;
    custom_fields?: Record<string, unknown> | null;
  }>;
  has_more: boolean;
  page_size: number;
  page_next?: string | null;
  page_prev?: string | null;
  url: string;
}
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
      custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
      custom_fields: Schema.optional(
        Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
      ),
    }),
  ),
  has_more: Schema.Boolean,
  page_size: Schema.Number,
  page_next: Schema.optional(Schema.NullOr(Schema.String)),
  page_prev: Schema.optional(Schema.NullOr(Schema.String)),
  url: Schema.String,
}) as unknown as GeneratedStructCodec<ListDocumentsOutput>;

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
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const listDocuments = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListDocumentsInput,
  outputSchema: ListDocumentsOutput,
}));
