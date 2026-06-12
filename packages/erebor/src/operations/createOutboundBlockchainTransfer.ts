import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const CreateOutboundBlockchainTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    deposit_account_id: Schema.String,
    counterparty_blockchain_address_id: Schema.String,
    amount: Schema.Struct({
      currency: Schema.Literals(["USAT", "USDC", "USDT"]),
      value: Schema.String,
    }),
    network: Schema.Literals(["BASE", "ETHEREUM", "INK", "SOLANA", "SUI"]),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(T.Http({ method: "POST", path: "/blockchain_out" }));
export type CreateOutboundBlockchainTransferInput =
  typeof CreateOutboundBlockchainTransferInput.Type;

// Output Schema
export const CreateOutboundBlockchainTransferOutput =
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
export type CreateOutboundBlockchainTransferOutput =
  typeof CreateOutboundBlockchainTransferOutput.Type;

// The operation
/**
 * Create Outbound Blockchain Transfer
 *
 * Create a new Outbound Blockchain Transfer.
 * Sending to an unsupported network or incorrect address may result in permanent loss. Erebor cannot recover these funds.
 *
 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const createOutboundBlockchainTransfer =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: CreateOutboundBlockchainTransferInput,
    outputSchema: CreateOutboundBlockchainTransferOutput,
    errors: [BadRequest, NotFound] as const,
  }));
