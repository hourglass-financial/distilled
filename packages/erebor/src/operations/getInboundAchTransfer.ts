import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const GetInboundAchTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(T.Http({ method: "GET", path: "/ach_in/{id}" }));
export type GetInboundAchTransferInput = typeof GetInboundAchTransferInput.Type;

// Output Schema
export const GetInboundAchTransferOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["ACH_IN"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    program_id: Schema.optional(Schema.NullOr(Schema.String)),
    status: Schema.Literals(["PENDING", "SETTLED", "FAILED", "RETURNED"]),
    deposit_account_id: Schema.String,
    amount: Schema.Struct({
      currency: Schema.Literals(["USD"]),
      exponent: Schema.Number,
      value: Schema.String,
      display_value: Schema.String,
    }),
    direction: Schema.Literals(["CREDIT", "DEBIT"]),
    sec_code: Schema.Literals([
      "PPD",
      "CCD",
      "WEB",
      "TEL",
      "CTX",
      "IAT",
      "ARC",
      "BOC",
      "POP",
      "RCK",
      "POS",
      "SHR",
      "MTE",
      "COR",
      "CIE",
      "DNE",
      "ENR",
      "ADV",
      "ACK",
      "ATX",
      "PBR",
      "TRC",
      "TRX",
      "XCK",
    ]),
    company_entry_description: Schema.String,
    originating_company_id: Schema.String,
    originating_company_name: Schema.String,
    effective_entry_date: Schema.String,
    addenda: Schema.Array(Schema.String),
    company_descriptive_date: Schema.optional(Schema.NullOr(Schema.String)),
    company_discretionary_data: Schema.optional(Schema.NullOr(Schema.String)),
    return_code: Schema.optional(Schema.NullOr(Schema.String)),
    returned_at: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.Unknown),
    custom_fields: Schema.optional(Schema.Unknown),
  });
export type GetInboundAchTransferOutput =
  typeof GetInboundAchTransferOutput.Type;

// The operation
/**
 * Retrieve Inbound ACH Transfer
 *
 * Retrieve a specific Inbound ACH Transfer by ID
 *
 * @param id - Inbound ACH transfer ID
 * @param Erebor-Version - Optional API version header. Use a date-based Erebor API version when you need to pin request behavior.
 */
export const getInboundAchTransfer = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: GetInboundAchTransferInput,
    outputSchema: GetInboundAchTransferOutput,
    errors: [BadRequest, NotFound] as const,
  }),
);
