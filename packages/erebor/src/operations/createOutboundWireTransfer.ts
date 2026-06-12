import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound, UnprocessableEntity } from "../errors.ts";

// Input Schema
export const CreateOutboundWireTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    deposit_account_id: Schema.String,
    counterparty_us_bank_account_id: Schema.String,
    amount: Schema.Struct({
      currency: Schema.Literals(["USD"]),
      value: Schema.String,
    }),
    memo: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(T.Http({ method: "POST", path: "/wire_out" }));
export type CreateOutboundWireTransferInput =
  typeof CreateOutboundWireTransferInput.Type;

// Output Schema
export const CreateOutboundWireTransferOutput =
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
export type CreateOutboundWireTransferOutput =
  typeof CreateOutboundWireTransferOutput.Type;

// The operation
/**
 * Create Outbound Wire Transfer
 *
 * Create a new Outbound Wire Transfer
 *
 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const createOutboundWireTransfer = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: CreateOutboundWireTransferInput,
    outputSchema: CreateOutboundWireTransferOutput,
    errors: [BadRequest, NotFound, UnprocessableEntity] as const,
  }),
);
