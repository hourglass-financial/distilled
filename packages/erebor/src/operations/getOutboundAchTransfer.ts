import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const GetOutboundAchTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(T.Http({ method: "GET", path: "/ach_out/{id}" }));
export type GetOutboundAchTransferInput =
  typeof GetOutboundAchTransferInput.Type;

// Output Schema
export const GetOutboundAchTransferOutput =
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
export type GetOutboundAchTransferOutput =
  typeof GetOutboundAchTransferOutput.Type;

// The operation
/**
 * Retrieve Outbound ACH Transfer
 *
 * Retrieve a specific Outbound ACH Transfer by ID
 *
 * @param id - Outbound ACH transfer ID
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getOutboundAchTransfer = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: GetOutboundAchTransferInput,
    outputSchema: GetOutboundAchTransferOutput,
    errors: [BadRequest, NotFound] as const,
  }),
);
