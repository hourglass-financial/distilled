import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const UpdateOutboundAchTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Idempotency-Key"),
    ),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(T.Http({ method: "PATCH", path: "/ach_out/{id}" }));
export type UpdateOutboundAchTransferInput =
  typeof UpdateOutboundAchTransferInput.Type;

// Output Schema
export const UpdateOutboundAchTransferOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["ACH_OUT"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    program_id: Schema.optional(Schema.NullOr(Schema.String)),
    status: Schema.Literals(["PENDING", "SETTLED", "FAILED", "RETURNED"]),
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
export type UpdateOutboundAchTransferOutput =
  typeof UpdateOutboundAchTransferOutput.Type;

// The operation
/**
 * Update Outbound ACH Transfer
 *
 * Update an outbound ACH transfer's `custom_ref` or `custom_fields`. Amount, parties, rail message fields, and status are immutable.
 *
 * @param id - Outbound ACH transfer ID
 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 * @param Erebor-Version - Optional API version header. Use a date-based Erebor API version when you need to pin request behavior.
 */
export const updateOutboundAchTransfer = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: UpdateOutboundAchTransferInput,
    outputSchema: UpdateOutboundAchTransferOutput,
    errors: [BadRequest, NotFound] as const,
  }),
);
