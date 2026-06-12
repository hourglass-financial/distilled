import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const GetInboundWireTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
  }).pipe(T.Http({ method: "GET", path: "/wire_in/{id}" }));
export type GetInboundWireTransferInput =
  typeof GetInboundWireTransferInput.Type;

// Output Schema
export const GetInboundWireTransferOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["WIRE_IN"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    program_id: Schema.optional(Schema.NullOr(Schema.String)),
    status: Schema.Literals([
      "PENDING",
      "SETTLED",
      "FAILED",
      "RETURNED",
      "RESOLVING_FROM_SUSPENSE",
    ]),
    counterparty_us_bank_account_id: Schema.String,
    deposit_account_id: Schema.String,
    bank_name: Schema.optional(Schema.NullOr(Schema.String)),
    debtor_routing_number: Schema.optional(Schema.NullOr(Schema.String)),
    debtor_account_number: Schema.optional(Schema.NullOr(Schema.String)),
    debtor_name: Schema.optional(Schema.NullOr(Schema.String)),
    creditor_name: Schema.optional(Schema.NullOr(Schema.String)),
    amount: Schema.Struct({
      currency: Schema.Literals(["USD"]),
      exponent: Schema.Number,
      value: Schema.String,
      display_value: Schema.String,
    }),
    end_to_end_id: Schema.String,
    imad: Schema.String,
    uetr: Schema.String,
    instruction_id: Schema.NullOr(Schema.String),
    memo: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.Unknown),
    custom_fields: Schema.optional(Schema.Unknown),
  });
export type GetInboundWireTransferOutput =
  typeof GetInboundWireTransferOutput.Type;

// The operation
/**
 * Retrieve Inbound Wire Transfer
 *
 * Retrieve a specific Inbound Wire Transfer by ID
 *
 * @param id - Inbound wire transfer ID
 */
export const getInboundWireTransfer = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: GetInboundWireTransferInput,
    outputSchema: GetInboundWireTransferOutput,
    errors: [BadRequest, NotFound] as const,
  }),
);
