import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound, Conflict } from "../errors.ts";

// Input Schema
export interface AttributeInboundBlockchainTransferInput {
  id: string;
  ereborVersion?: string;
  ereborIdempotencyKey?: string;
  counterparty_id: string;
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
}
export const AttributeInboundBlockchainTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
    ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Idempotency-Key"),
    ),
    counterparty_id: Schema.String,
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
  }).pipe(
    T.Http({ method: "POST", path: "/blockchain_in/{id}/attribute" }),
  ) as unknown as GeneratedStructCodec<AttributeInboundBlockchainTransferInput>;

// Output Schema
export interface AttributeInboundBlockchainTransferOutput {
  id: string;
  type: "BLOCKCHAIN_IN";
  url: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  program_id?: string | null;
  status: "CREATED" | "PENDING" | "NEEDS_ATTRIBUTION" | "SETTLED" | "FAILED";
  deposit_account_id: string;
  counterparty_blockchain_address_id?: string | null;
  amount: {
    currency: "USAT" | "USDC" | "USDT";
    exponent: number;
    value: string;
    display_value: string;
  };
  network: "BASE" | "ETHEREUM" | "INK" | "SOLANA" | "SUI";
  transaction_hash?: string | null;
  from_address?: string | null;
  to_address?: string | null;
  custom_ref?: string | null;
  custom_fields?: Record<string, unknown> | null;
}
export const AttributeInboundBlockchainTransferOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["BLOCKCHAIN_IN"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    program_id: Schema.optional(Schema.NullOr(Schema.String)),
    status: Schema.Literals([
      "CREATED",
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
    custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
    custom_fields: Schema.optional(
      Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
    ),
  }) as unknown as GeneratedStructCodec<AttributeInboundBlockchainTransferOutput>;

// The operation
/**
 * Attribute Inbound Blockchain Transfer
 *
 * Attribute an Inbound Blockchain Transfer to a counterparty with custodian information
 *
 * @param id - Inbound blockchain transfer ID
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param ereborIdempotencyKey - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const attributeInboundBlockchainTransfer =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: AttributeInboundBlockchainTransferInput,
    outputSchema: AttributeInboundBlockchainTransferOutput,
    errors: [BadRequest, NotFound, Conflict] as const,
  }));
