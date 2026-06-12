import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const GetBookTransferInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String.pipe(T.PathParam()),
}).pipe(T.Http({ method: "GET", path: "/book_transfers/{id}" }));
export type GetBookTransferInput = typeof GetBookTransferInput.Type;

// Output Schema
export const GetBookTransferOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String,
  type: Schema.Literals(["BOOK_TRANSFER"]),
  url: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  archived_at: Schema.optional(Schema.NullOr(Schema.String)),
  program_id: Schema.optional(Schema.NullOr(Schema.String)),
  status: Schema.Literals(["PENDING", "FAILED", "SETTLED"]),
  from_deposit_account_id: Schema.String,
  to_deposit_account_id: Schema.String,
  amount: Schema.Struct({
    currency: Schema.Literals(["USD"]),
    exponent: Schema.Number,
    value: Schema.String,
    display_value: Schema.String,
  }),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  custom_ref: Schema.optional(Schema.Unknown),
  custom_fields: Schema.optional(Schema.Unknown),
});
export type GetBookTransferOutput = typeof GetBookTransferOutput.Type;

// The operation
/**
 * Retrieve Book Transfer
 *
 * Retrieve a specific Book Transfer by ID
 *
 * @param id - Book transfer ID
 */
export const getBookTransfer = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetBookTransferInput,
  outputSchema: GetBookTransferOutput,
  errors: [BadRequest, NotFound] as const,
}));
