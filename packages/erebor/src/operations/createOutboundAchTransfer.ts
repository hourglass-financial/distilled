import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Conflict } from "../errors.ts";

// Input Schema
export const CreateOutboundAchTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
    ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Idempotency-Key"),
    ),
    deposit_account_id: Schema.String,
    counterparty_us_bank_account_id: Schema.String,
    amount: Schema.Struct({
      currency: Schema.Literals(["USD"]),
      value: Schema.String,
    }),
    direction: Schema.Literals(["CREDIT", "DEBIT"]),
    sec_code: Schema.Literals(["CCD", "PPD", "WEB"]),
    company_entry_description: Schema.String,
    company_discretionary_data: Schema.optional(Schema.String),
    addenda: Schema.optional(Schema.NullOr(Schema.Array(Schema.String))),
    service: Schema.optional(Schema.Literals(["SAME_DAY", "STANDARD"])),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(T.Http({ method: "POST", path: "/ach_out" }));
export type CreateOutboundAchTransferInput =
  typeof CreateOutboundAchTransferInput.Type;

// Output Schema
export const CreateOutboundAchTransferOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["ACH_OUT"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    program_id: Schema.optional(Schema.NullOr(Schema.String)),
    status: Schema.Literals([
      "CREATED",
      "PENDING",
      "SETTLED",
      "FAILED",
      "RETURNED",
    ]),
    deposit_account_id: Schema.String,
    counterparty_us_bank_account_id: Schema.String,
    amount: Schema.Struct({
      currency: Schema.Literals(["USD"]),
      exponent: Schema.Number,
      value: Schema.String,
      display_value: Schema.String,
    }),
    direction: Schema.Literals(["CREDIT", "DEBIT"]),
    sec_code: Schema.Literals(["CCD", "PPD", "WEB"]),
    company_entry_description: Schema.String,
    effective_entry_date: Schema.optional(Schema.NullOr(Schema.String)),
    addenda: Schema.Array(Schema.String),
    company_discretionary_data: Schema.optional(Schema.NullOr(Schema.String)),
    service: Schema.Literals(["SAME_DAY", "STANDARD"]),
    custom_ref: Schema.optional(Schema.Unknown),
    custom_fields: Schema.optional(Schema.Unknown),
    return_code: Schema.optional(Schema.NullOr(Schema.String)),
    returned_at: Schema.optional(Schema.NullOr(Schema.String)),
  });
export type CreateOutboundAchTransferOutput =
  typeof CreateOutboundAchTransferOutput.Type;

// The operation
/**
 * Create Outbound ACH Transfer
 *
 * Create a new Outbound ACH Transfer
 *
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const createOutboundAchTransfer = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: CreateOutboundAchTransferInput,
    outputSchema: CreateOutboundAchTransferOutput,
    errors: [BadRequest, Conflict] as const,
  }),
);
