import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const GetBlockchainAddressInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
  }).pipe(T.Http({ method: "GET", path: "/blockchain_addresses/{id}" }));
export type GetBlockchainAddressInput = typeof GetBlockchainAddressInput.Type;

// Output Schema
export const GetBlockchainAddressOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
  });
export type GetBlockchainAddressOutput = typeof GetBlockchainAddressOutput.Type;

// The operation
/**
 * Retrieve Blockchain Address
 *
 * Retrieve a specific Blockchain Address by ID
 *
 * @param id - Blockchain address ID
 */
export const getBlockchainAddress = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: GetBlockchainAddressInput,
    outputSchema: GetBlockchainAddressOutput,
    errors: [BadRequest, NotFound] as const,
  }),
);
