import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const UpdateOutboundBlockchainTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(T.Http({ method: "PATCH", path: "/blockchain_out/{id}" }));
export type UpdateOutboundBlockchainTransferInput =
  typeof UpdateOutboundBlockchainTransferInput.Type;

// Output Schema
export const UpdateOutboundBlockchainTransferOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["BLOCKCHAIN_OUT"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    program_id: Schema.optional(Schema.NullOr(Schema.String)),
    status: Schema.Literals(["PENDING", "SETTLED", "FAILED"]),
    deposit_account_id: Schema.String,
    counterparty_blockchain_address_id: Schema.String,
    amount: Schema.Struct({
      currency: Schema.Literals(["USAT", "USDC", "USDT"]),
      exponent: Schema.Number,
      value: Schema.String,
      display_value: Schema.String,
    }),
    network: Schema.Literals(["BASE", "ETHEREUM", "INK", "SOLANA", "SUI"]),
    transaction_hash: Schema.optional(Schema.NullOr(Schema.String)),
    from_address: Schema.optional(Schema.NullOr(Schema.String)),
    to_address: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.Unknown),
    custom_fields: Schema.optional(Schema.Unknown),
  });
export type UpdateOutboundBlockchainTransferOutput =
  typeof UpdateOutboundBlockchainTransferOutput.Type;

// The operation
/**
 * Update Outbound Blockchain Transfer
 *
 * Update an outbound blockchain transfer's `custom_ref` or `custom_fields`. Amount, parties, network, and status are immutable.
 *
 * @param id - Outbound blockchain transfer ID
 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const updateOutboundBlockchainTransfer =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: UpdateOutboundBlockchainTransferInput,
    outputSchema: UpdateOutboundBlockchainTransferOutput,
    errors: [BadRequest, NotFound] as const,
  }));
