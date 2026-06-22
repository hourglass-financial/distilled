import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound, UnprocessableEntity } from "../errors.ts";

// Input Schema
export const CreateOutboundRailTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Idempotency-Key"),
    ),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
    from_deposit_account_id: Schema.String,
    counterparty_rail_address_id: Schema.optional(Schema.NullOr(Schema.String)),
    to_deposit_account_id: Schema.optional(Schema.NullOr(Schema.String)),
    amount: Schema.Struct({
      currency: Schema.Literals(["USD"]),
      value: Schema.String,
    }),
    memo: Schema.optional(Schema.NullOr(Schema.String)),
    internal_note: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(T.Http({ method: "POST", path: "/rail_out" }));
export type CreateOutboundRailTransferInput =
  typeof CreateOutboundRailTransferInput.Type;

// Output Schema
export const CreateOutboundRailTransferOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["RAIL_OUT"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    program_id: Schema.optional(Schema.NullOr(Schema.String)),
    status: Schema.Literals(["PENDING", "SETTLED", "FAILED"]),
    from_deposit_account_id: Schema.String,
    counterparty_rail_address_id: Schema.optional(Schema.NullOr(Schema.String)),
    to_deposit_account_id: Schema.optional(Schema.NullOr(Schema.String)),
    amount: Schema.Struct({
      currency: Schema.Literals(["USD"]),
      exponent: Schema.Number,
      value: Schema.String,
      display_value: Schema.String,
    }),
    memo: Schema.optional(Schema.NullOr(Schema.String)),
    internal_note: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.Unknown),
    custom_fields: Schema.optional(Schema.Unknown),
  });
export type CreateOutboundRailTransferOutput =
  typeof CreateOutboundRailTransferOutput.Type;

// The operation
/**
 * Create Outbound Rail Transfer
 *
 * Create a new Outbound Rail Transfer
 *
 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 * @param Erebor-Version - Optional API version header. Use a date-based Erebor API version when you need to pin request behavior.
 */
export const createOutboundRailTransfer = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: CreateOutboundRailTransferInput,
    outputSchema: CreateOutboundRailTransferOutput,
    errors: [BadRequest, NotFound, UnprocessableEntity] as const,
  }),
);
