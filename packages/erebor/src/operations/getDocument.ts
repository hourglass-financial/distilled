import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface GetDocumentInput {
  id: string;
  ereborVersion?: string;
}
export const GetDocumentInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String.pipe(T.PathParam()),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
}).pipe(
  T.Http({ method: "GET", path: "/documents/{id}" }),
) as unknown as Schema.Codec<GetDocumentInput>;

// Output Schema
export interface GetDocumentOutput {
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
}
export const GetDocumentOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
}) as unknown as Schema.Codec<GetDocumentOutput>;

// The operation
/**
 * Retrieve Document
 *
 * Retrieve document metadata and download URL
 *
 * @param id - Document ID
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getDocument = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetDocumentInput,
  outputSchema: GetDocumentOutput,
  errors: [BadRequest, NotFound] as const,
}));
