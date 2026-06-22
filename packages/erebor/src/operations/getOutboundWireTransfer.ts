import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const GetOutboundWireTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(T.Http({ method: "GET", path: "/wire_out/{id}" }));
export type GetOutboundWireTransferInput =
  typeof GetOutboundWireTransferInput.Type;

// Output Schema
export const GetOutboundWireTransferOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["WIRE_OUT"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    program_id: Schema.optional(Schema.NullOr(Schema.String)),
    status: Schema.Literals(["PENDING", "SETTLED", "FAILED", "RETURNED"]),
    deposit_account_id: Schema.String,
    counterparty_us_bank_account_id: Schema.String,
    bank_name: Schema.optional(Schema.NullOr(Schema.String)),
    creditor_routing_number: Schema.optional(Schema.String),
    creditor_account_number: Schema.optional(Schema.String),
    creditor_name: Schema.optional(Schema.String),
    amount: Schema.Struct({
      currency: Schema.Literals(["USD"]),
      exponent: Schema.Number,
      value: Schema.String,
      display_value: Schema.String,
    }),
    end_to_end_id: Schema.String,
    imad: Schema.String,
    instruction_id: Schema.String,
    uetr: Schema.String,
    memo: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.Unknown),
    custom_fields: Schema.optional(Schema.Unknown),
  });
export type GetOutboundWireTransferOutput =
  typeof GetOutboundWireTransferOutput.Type;

// The operation
/**
 * Retrieve Outbound Wire Transfer
 *
 * Retrieve a specific Outbound Wire Transfer by ID
 *
 * @param id - Outbound wire transfer ID
 * @param Erebor-Version - Optional API version header. Use a date-based Erebor API version when you need to pin request behavior.
 */
export const getOutboundWireTransfer = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: GetOutboundWireTransferInput,
    outputSchema: GetOutboundWireTransferOutput,
    errors: [BadRequest, NotFound] as const,
  }),
);
