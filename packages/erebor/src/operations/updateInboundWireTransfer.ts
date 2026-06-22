import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const UpdateInboundWireTransferInput =
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
  }).pipe(T.Http({ method: "PATCH", path: "/wire_in/{id}" }));
export type UpdateInboundWireTransferInput =
  typeof UpdateInboundWireTransferInput.Type;

// Output Schema
export const UpdateInboundWireTransferOutput =
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
export type UpdateInboundWireTransferOutput =
  typeof UpdateInboundWireTransferOutput.Type;

// The operation
/**
 * Update Inbound Wire Transfer
 *
 * Update an inbound wire transfer's `custom_ref` or `custom_fields` for reconciliation. All other fields are immutable.
 *
 * @param id - Inbound wire transfer ID
 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 * @param Erebor-Version - Optional API version header. Use a date-based Erebor API version when you need to pin request behavior.
 */
export const updateInboundWireTransfer = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: UpdateInboundWireTransferInput,
    outputSchema: UpdateInboundWireTransferOutput,
    errors: [BadRequest, NotFound] as const,
  }),
);
