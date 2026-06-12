import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";

// Input Schema
export const ListBlockchainAddressesInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    page_size: Schema.optional(Schema.Number),
    starting_after: Schema.optional(Schema.String),
    ending_before: Schema.optional(Schema.String),
    deposit_account_id: Schema.optional(Schema.String),
    address: Schema.optional(Schema.String),
    custom_ref: Schema.optional(Schema.String),
  }).pipe(T.Http({ method: "GET", path: "/blockchain_addresses" }));
export type ListBlockchainAddressesInput =
  typeof ListBlockchainAddressesInput.Type;

// Output Schema
export const ListBlockchainAddressesOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
        id: Schema.String,
        type: Schema.Literals(["BLOCKCHAIN_ADDRESS"]),
        url: Schema.String,
        created_at: Schema.String,
        updated_at: Schema.String,
        archived_at: Schema.optional(Schema.NullOr(Schema.String)),
        deposit_account_id: Schema.String,
        name: Schema.optional(Schema.NullOr(Schema.String)),
        address: Schema.String,
        address_type: Schema.Literals(["ETHEREUM", "SOLANA", "SUI"]),
        network: Schema.Array(
          Schema.Literals(["BASE", "ETHEREUM", "INK", "SOLANA", "SUI"]),
        ),
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
export type ListBlockchainAddressesOutput =
  typeof ListBlockchainAddressesOutput.Type;

// The operation
/**
 * List Blockchain Addresses
 *
 * Retrieve a paginated list of Blockchain Addresses
 *
 * @param page_size - Number of items per page (max 100)
 * @param starting_after - Cursor for pagination (exclusive start)
 * @param ending_before - Cursor for pagination (exclusive end)
 * @param deposit_account_id - Filter by Deposit Account ID
 * @param address - Filter by on-chain address (EVM addresses are often matched case-insensitively)
 * @param custom_ref - Filter by exact `custom_ref` match (case-sensitive, up to 255 characters).
 */
export const listBlockchainAddresses = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: ListBlockchainAddressesInput,
    outputSchema: ListBlockchainAddressesOutput,
  }),
);
