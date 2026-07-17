import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface GetBookTransferInput {
  id: string;
  ereborVersion?: string;
}
export const GetBookTransferInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String.pipe(T.PathParam()),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
}).pipe(
  T.Http({ method: "GET", path: "/book_transfers/{id}" }),
) as unknown as GeneratedStructCodec<GetBookTransferInput>;

// Output Schema
export interface GetBookTransferOutput {
  id: string;
  type: "BOOK_TRANSFER";
  url: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  program_id?: string | null;
  status: "PENDING" | "FAILED" | "SETTLED" | "CREATED";
  from_deposit_account_id: string;
  to_deposit_account_id: string;
  amount: {
    currency: "USD";
    exponent: number;
    value: string;
    display_value: string;
  };
  memo?: string | null;
  custom_ref?: string | null;
  custom_fields?: Record<string, unknown> | null;
}
export const GetBookTransferOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String,
  type: Schema.Literals(["BOOK_TRANSFER"]),
  url: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  archived_at: Schema.optional(Schema.NullOr(Schema.String)),
  program_id: Schema.optional(Schema.NullOr(Schema.String)),
  status: Schema.Literals(["PENDING", "FAILED", "SETTLED", "CREATED"]),
  from_deposit_account_id: Schema.String,
  to_deposit_account_id: Schema.String,
  amount: Schema.Struct({
    currency: Schema.Literals(["USD"]),
    exponent: Schema.Number,
    value: Schema.String,
    display_value: Schema.String,
  }),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
  custom_fields: Schema.optional(
    Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
  ),
}) as unknown as GeneratedStructCodec<GetBookTransferOutput>;

// The operation
/**
 * Retrieve Book Transfer
 *
 * Retrieve a specific Book Transfer by ID
 *
 * @param id - Book transfer ID
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getBookTransfer = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetBookTransferInput,
  outputSchema: GetBookTransferOutput,
  errors: [BadRequest, NotFound] as const,
}));
