import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const UpdateOutboundInternationalWireTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(T.Http({ method: "PATCH", path: "/international_wire_out/{id}" }));
export type UpdateOutboundInternationalWireTransferInput =
  typeof UpdateOutboundInternationalWireTransferInput.Type;

// Output Schema
export const UpdateOutboundInternationalWireTransferOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["INTERNATIONAL_WIRE_OUT"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    program_id: Schema.optional(Schema.NullOr(Schema.String)),
    status: Schema.Literals(["PENDING", "SETTLED", "FAILED", "RETURNED"]),
    deposit_account_id: Schema.String,
    counterparty_international_bank_account_id: Schema.String,
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
export type UpdateOutboundInternationalWireTransferOutput =
  typeof UpdateOutboundInternationalWireTransferOutput.Type;

// The operation
/**
 * Update Outbound International Wire
 *
 * Update an outbound international wire transfer's `custom_ref` or `custom_fields`. Amount, parties, rail message fields, and status are immutable.
 *
 * @param id - Outbound International Wire ID
 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const updateOutboundInternationalWireTransfer =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: UpdateOutboundInternationalWireTransferInput,
    outputSchema: UpdateOutboundInternationalWireTransferOutput,
    errors: [BadRequest, NotFound] as const,
  }));
