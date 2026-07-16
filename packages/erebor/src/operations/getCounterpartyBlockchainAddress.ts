import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface GetCounterpartyBlockchainAddressInput {
  id: string;
  ereborVersion?: string;
}
export const GetCounterpartyBlockchainAddressInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/counterparty_blockchain_addresses/{id}" }),
  ) as unknown as Schema.Codec<GetCounterpartyBlockchainAddressInput>;

// Output Schema
export interface GetCounterpartyBlockchainAddressOutput {
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
}
export const GetCounterpartyBlockchainAddressOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
  }) as unknown as Schema.Codec<GetCounterpartyBlockchainAddressOutput>;

// The operation
/**
 * Retrieve Counterparty Blockchain Address
 *
 * Retrieve a specific Counterparty Blockchain Address by ID
 *
 * @param id - Contact Blockchain Address ID
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getCounterpartyBlockchainAddress =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: GetCounterpartyBlockchainAddressInput,
    outputSchema: GetCounterpartyBlockchainAddressOutput,
    errors: [BadRequest, NotFound] as const,
  }));
