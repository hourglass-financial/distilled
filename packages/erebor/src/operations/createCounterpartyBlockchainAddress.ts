import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import {
  BadRequest,
  Conflict,
  UnprocessableEntity,
  EreborValidationError,
} from "../errors.ts";

// Input Schema
export interface CreateCounterpartyBlockchainAddressInput {
  ereborVersion?: string;
  ereborIdempotencyKey?: string;
  counterparty_id: string;
  description: string;
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
  custom_ref?: string;
  custom_fields?: Record<string, unknown>;
}
export const CreateCounterpartyBlockchainAddressInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
    ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Idempotency-Key"),
    ),
    counterparty_id: Schema.String,
    description: Schema.String,
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
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(
    T.Http({ method: "POST", path: "/counterparty_blockchain_addresses" }),
  ) as unknown as GeneratedStructCodec<CreateCounterpartyBlockchainAddressInput>;

// Output Schema
export interface CreateCounterpartyBlockchainAddressOutput {
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
export const CreateCounterpartyBlockchainAddressOutput =
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
  }) as unknown as GeneratedStructCodec<CreateCounterpartyBlockchainAddressOutput>;

// The operation
/**
 * Create Counterparty Blockchain Address
 *
 * Create a new Blockchain Address for a Counterparty
 *
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param ereborIdempotencyKey - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const createCounterpartyBlockchainAddress =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: CreateCounterpartyBlockchainAddressInput,
    outputSchema: CreateCounterpartyBlockchainAddressOutput,
    errors: [
      BadRequest,
      Conflict,
      UnprocessableEntity,
      EreborValidationError,
    ] as const,
  }));
