import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";

// Input Schema
export const ListOutboundBlockchainTransfersInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    page_size: Schema.optional(Schema.Number),
    starting_after: Schema.optional(Schema.String),
    ending_before: Schema.optional(Schema.String),
    deposit_account_id: Schema.optional(Schema.String),
    status: Schema.optional(Schema.String),
    customer_id: Schema.optional(Schema.String),
    network: Schema.optional(Schema.String),
    program_id: Schema.optional(Schema.String),
    custom_ref: Schema.optional(Schema.String),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(T.Http({ method: "GET", path: "/blockchain_out" }));
export type ListOutboundBlockchainTransfersInput =
  typeof ListOutboundBlockchainTransfersInput.Type;

// Output Schema
export const ListOutboundBlockchainTransfersOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
        id: Schema.String,
        type: Schema.Literals(["BLOCKCHAIN_OUT"]),
        url: Schema.String,
        created_at: Schema.String,
        updated_at: Schema.String,
        archived_at: Schema.optional(Schema.NullOr(Schema.String)),
        program_id: Schema.optional(Schema.NullOr(Schema.String)),
        status: Schema.Literals(["CREATED", "PENDING", "SETTLED", "FAILED"]),
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
      }),
    ),
    has_more: Schema.Boolean,
    page_size: Schema.Number,
    page_next: Schema.optional(Schema.NullOr(Schema.String)),
    page_prev: Schema.optional(Schema.NullOr(Schema.String)),
    url: Schema.String,
  });
export type ListOutboundBlockchainTransfersOutput =
  typeof ListOutboundBlockchainTransfersOutput.Type;

// The operation
/**
 * List Outbound Blockchain Transfers
 *
 * Retrieve a paginated list of Outbound Blockchain Transfers
 *
 * @param page_size - Number of items per page (max 100)
 * @param starting_after - Cursor for pagination (exclusive start)
 * @param ending_before - Cursor for pagination (exclusive end)
 * @param deposit_account_id - Filter by deposit account ID
 * @param status - Filter by transfer status
 * @param customer_id - Filter by customer ID
 * @param network - Filter by blockchain network
 * @param program_id - Filter by program ID
 * @param custom_ref - Filter by exact `custom_ref` match (case-sensitive, up to 255 characters).
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const listOutboundBlockchainTransfers =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: ListOutboundBlockchainTransfersInput,
    outputSchema: ListOutboundBlockchainTransfersOutput,
  }));
