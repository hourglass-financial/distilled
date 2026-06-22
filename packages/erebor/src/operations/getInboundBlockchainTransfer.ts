import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const GetInboundBlockchainTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(T.Http({ method: "GET", path: "/blockchain_in/{id}" }));
export type GetInboundBlockchainTransferInput =
  typeof GetInboundBlockchainTransferInput.Type;

// Output Schema
export const GetInboundBlockchainTransferOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["BLOCKCHAIN_IN"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    program_id: Schema.optional(Schema.NullOr(Schema.String)),
    status: Schema.Literals([
      "PENDING",
      "NEEDS_ATTRIBUTION",
      "SETTLED",
      "FAILED",
    ]),
    deposit_account_id: Schema.String,
    counterparty_blockchain_address_id: Schema.optional(
      Schema.NullOr(Schema.String),
    ),
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
export type GetInboundBlockchainTransferOutput =
  typeof GetInboundBlockchainTransferOutput.Type;

// The operation
/**
 * Retrieve Inbound Blockchain Transfer
 *
 * Retrieve a specific Inbound Blockchain Transfer by ID
 *
 * @param id - Inbound blockchain transfer ID
 * @param Erebor-Version - Optional API version header. Use a date-based Erebor API version when you need to pin request behavior.
 */
export const getInboundBlockchainTransfer =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: GetInboundBlockchainTransferInput,
    outputSchema: GetInboundBlockchainTransferOutput,
    errors: [BadRequest, NotFound] as const,
  }));
