import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";

// Input Schema
export interface ListCounterpartyBlockchainAddressesInput {
  page_size?: number;
  starting_after?: string;
  ending_before?: string;
  counterparty_id?: string;
  customer_id?: string;
  program_id?: string;
  custom_ref?: string;
  ereborVersion?: string;
}
export const ListCounterpartyBlockchainAddressesInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    page_size: Schema.optional(Schema.Number).pipe(T.HttpQuery("page_size")),
    starting_after: Schema.optional(Schema.String).pipe(
      T.HttpQuery("starting_after"),
    ),
    ending_before: Schema.optional(Schema.String).pipe(
      T.HttpQuery("ending_before"),
    ),
    counterparty_id: Schema.optional(Schema.String).pipe(
      T.HttpQuery("counterparty_id"),
    ),
    customer_id: Schema.optional(Schema.String).pipe(
      T.HttpQuery("customer_id"),
    ),
    program_id: Schema.optional(Schema.String).pipe(T.HttpQuery("program_id")),
    custom_ref: Schema.optional(Schema.String).pipe(T.HttpQuery("custom_ref")),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/counterparty_blockchain_addresses" }),
  ) as unknown as GeneratedStructCodec<ListCounterpartyBlockchainAddressesInput>;

// Output Schema
export interface ListCounterpartyBlockchainAddressesOutput {
  data: ReadonlyArray<{
    id: string;
    type: "COUNTERPARTY_BLOCKCHAIN_ADDRESS";
    url: string;
    created_at: string;
    updated_at: string;
    archived_at?: string | null;
    customer_id?: string | null;
    program_id?: string | null;
    counterparty_id?: string | null;
    description: string | null;
    address: string;
    network: "BASE" | "ETHEREUM" | "INK" | "SOLANA" | "SUI";
    custodian:
      | "ANCHORAGE_SG"
      | "ANCHORAGE_US"
      | "AQUANOW_CA"
      | "B2C2_UK"
      | "B2C2_US"
      | "BITGO_SG"
      | "BITGO_US"
      | "BITSTAMP_US"
      | "BVNK_US"
      | "CIRCLE_FR"
      | "CIRCLE_US"
      | "CITIBANK_US"
      | "COINBASE_US"
      | "COINSMART_CA"
      | "COPPER_CH"
      | "COPPER_UK"
      | "CUMBERLAND_DRW_LLC_US"
      | "CUMBERLAND_SG"
      | "EREBOR_BANK_US"
      | "FALCONX_US"
      | "FIDELITY_UK"
      | "FIDELITY_US"
      | "FIREBLOCKS_APAC"
      | "FIREBLOCKS_US"
      | "GALAXY_KY"
      | "GEMINI_US"
      | "KRAKEN_BVI"
      | "KRAKEN_EU_IE"
      | "KRAKEN_UK"
      | "KRAKEN_US"
      | "NUBANK_BR"
      | "PAXOS_US"
      | "RAMP_NETWORK_US"
      | "ROBINHOOD_US"
      | "WINTERMUTE_GB"
      | "SELF_HOSTED"
      | "OTHER";
    custodian_other?: string | null;
    custom_ref?: string | null;
    custom_fields?: Record<string, unknown> | null;
  }>;
  has_more: boolean;
  page_size: number;
  page_next?: string | null;
  page_prev?: string | null;
  url: string;
}
export const ListCounterpartyBlockchainAddressesOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
        id: Schema.String,
        type: Schema.Literals(["COUNTERPARTY_BLOCKCHAIN_ADDRESS"]),
        url: Schema.String,
        created_at: Schema.String,
        updated_at: Schema.String,
        archived_at: Schema.optional(Schema.NullOr(Schema.String)),
        customer_id: Schema.optional(Schema.NullOr(Schema.String)),
        program_id: Schema.optional(Schema.NullOr(Schema.String)),
        counterparty_id: Schema.optional(Schema.NullOr(Schema.String)),
        description: Schema.NullOr(Schema.String),
        address: Schema.String,
        network: Schema.Literals(["BASE", "ETHEREUM", "INK", "SOLANA", "SUI"]),
        custodian: Schema.Literals([
          "ANCHORAGE_SG",
          "ANCHORAGE_US",
          "AQUANOW_CA",
          "B2C2_UK",
          "B2C2_US",
          "BITGO_SG",
          "BITGO_US",
          "BITSTAMP_US",
          "BVNK_US",
          "CIRCLE_FR",
          "CIRCLE_US",
          "CITIBANK_US",
          "COINBASE_US",
          "COINSMART_CA",
          "COPPER_CH",
          "COPPER_UK",
          "CUMBERLAND_DRW_LLC_US",
          "CUMBERLAND_SG",
          "EREBOR_BANK_US",
          "FALCONX_US",
          "FIDELITY_UK",
          "FIDELITY_US",
          "FIREBLOCKS_APAC",
          "FIREBLOCKS_US",
          "GALAXY_KY",
          "GEMINI_US",
          "KRAKEN_BVI",
          "KRAKEN_EU_IE",
          "KRAKEN_UK",
          "KRAKEN_US",
          "NUBANK_BR",
          "PAXOS_US",
          "RAMP_NETWORK_US",
          "ROBINHOOD_US",
          "WINTERMUTE_GB",
          "SELF_HOSTED",
          "OTHER",
        ]),
        custodian_other: Schema.optional(Schema.NullOr(Schema.String)),
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
  }) as unknown as GeneratedStructCodec<ListCounterpartyBlockchainAddressesOutput>;

// The operation
/**
 * List Counterparty Blockchain Addresses
 *
 * Retrieve a paginated list of Counterparty Blockchain Addresses
 *
 * @param page_size - Number of items per page (max 100)
 * @param starting_after - Cursor for pagination (exclusive start)
 * @param ending_before - Cursor for pagination (exclusive end)
 * @param counterparty_id - Filter by Counterparty ID
 * @param customer_id - Filter by customer ID
 * @param program_id - Filter by program ID
 * @param custom_ref - Filter by exact `custom_ref` match (case-sensitive, up to 255 characters).
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const listCounterpartyBlockchainAddresses =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: ListCounterpartyBlockchainAddressesInput,
    outputSchema: ListCounterpartyBlockchainAddressesOutput,
  }));
