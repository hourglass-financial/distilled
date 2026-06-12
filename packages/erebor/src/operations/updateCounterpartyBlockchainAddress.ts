import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const UpdateCounterpartyBlockchainAddressInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    description: Schema.optional(Schema.String),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(
    T.Http({
      method: "PATCH",
      path: "/counterparty_blockchain_addresses/{id}",
    }),
  );
export type UpdateCounterpartyBlockchainAddressInput =
  typeof UpdateCounterpartyBlockchainAddressInput.Type;

// Output Schema
export const UpdateCounterpartyBlockchainAddressOutput =
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
    custom_ref: Schema.optional(Schema.Unknown),
    custom_fields: Schema.optional(Schema.Unknown),
  });
export type UpdateCounterpartyBlockchainAddressOutput =
  typeof UpdateCounterpartyBlockchainAddressOutput.Type;

// The operation
/**
 * Update Counterparty Blockchain Address
 *
 * Update a counterparty blockchain address's `description`, `custom_ref`, or `custom_fields`. The on-chain address, network, and custodian are immutable.
 *
 * @param id - Counterparty Blockchain Address ID
 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const updateCounterpartyBlockchainAddress =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: UpdateCounterpartyBlockchainAddressInput,
    outputSchema: UpdateCounterpartyBlockchainAddressOutput,
    errors: [BadRequest, NotFound] as const,
  }));
