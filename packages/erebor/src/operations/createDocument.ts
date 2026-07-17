import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, Conflict } from "../errors.ts";

// Input Schema
export interface CreateDocumentInput {
  ereborVersion?: string;
  ereborIdempotencyKey?: string;
  file: string;
  document_type:
    | "US_DRIVERS_LICENSE"
    | "PASSPORT"
    | "FORMATION_DOCUMENT"
    | "IRS_EIN_CONFIRMATION"
    | "OTHER";
  name: string;
  description?: string;
  program_id: string;
  custom_ref?: string;
  custom_fields?: Record<string, unknown>;
}
export const CreateDocumentInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
  ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Idempotency-Key"),
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
) as unknown as GeneratedStructCodec<CreateDocumentInput>;

// Output Schema
export interface CreateDocumentOutput {
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
  custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
  custom_fields: Schema.optional(
    Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
  ),
}) as unknown as GeneratedStructCodec<CreateDocumentOutput>;

// The operation
/**
 * Upload Document
 *
 * Upload a document for Onboarding verification
 *
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param ereborIdempotencyKey - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const createDocument = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateDocumentInput,
  outputSchema: CreateDocumentOutput,
  errors: [BadRequest, Conflict] as const,
}));
