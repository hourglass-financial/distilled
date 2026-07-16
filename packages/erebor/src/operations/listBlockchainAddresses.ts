import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";

// Input Schema
export interface ListBlockchainAddressesInput {
  page_size?: number;
  starting_after?: string;
  ending_before?: string;
  deposit_account_id?: string;
  address?: string;
  custom_ref?: string;
  ereborVersion?: string;
}
export const ListBlockchainAddressesInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    page_size: Schema.optional(Schema.Number),
    starting_after: Schema.optional(Schema.String),
    ending_before: Schema.optional(Schema.String),
    deposit_account_id: Schema.optional(Schema.String),
    address: Schema.optional(Schema.String),
    custom_ref: Schema.optional(Schema.String),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/blockchain_addresses" }),
  ) as unknown as Schema.Codec<ListBlockchainAddressesInput>;

// Output Schema
export interface ListBlockchainAddressesOutput {
  data: ReadonlyArray<{
    id: string;
    type: "BLOCKCHAIN_ADDRESS";
    url: string;
    created_at: string;
    updated_at: string;
    archived_at?: string | null;
    deposit_account_id: string;
    name?: string | null;
    address: string;
    address_type: "ETHEREUM" | "SOLANA" | "SUI";
    network: ReadonlyArray<"BASE" | "ETHEREUM" | "INK" | "SOLANA" | "SUI">;
    custom_ref?: string | null;
    custom_fields?: Record<string, unknown> | null;
  }>;
  has_more: boolean;
  page_size: number;
  page_next?: string | null;
  page_prev?: string | null;
  url: string;
}
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
        custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
        custom_fields: Schema.optional(
          Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
        ),
      }),
    ),
    has_more: Schema.Boolean,
    page_size: Schema.Number,
    page_next: Schema.optional(Schema.NullOr(Schema.String)),
    page_prev: Schema.optional(Schema.NullOr(Schema.String)),
    url: Schema.String,
  }) as unknown as Schema.Codec<ListBlockchainAddressesOutput>;

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
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const listBlockchainAddresses = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: ListBlockchainAddressesInput,
    outputSchema: ListBlockchainAddressesOutput,
  }),
);
