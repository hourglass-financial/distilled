import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const CreateBlockchainAddressInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    deposit_account_id: Schema.String,
    address_type: Schema.Literals(["ETHEREUM", "SOLANA", "SUI"]),
    name: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(T.Http({ method: "POST", path: "/blockchain_addresses" }));
export type CreateBlockchainAddressInput =
  typeof CreateBlockchainAddressInput.Type;

// Output Schema
export const CreateBlockchainAddressOutput =
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
export type CreateBlockchainAddressOutput =
  typeof CreateBlockchainAddressOutput.Type;

// The operation
/**
 * Create Blockchain Address
 *
 * Create a new Blockchain Address for a Deposit Account
 *
 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const createBlockchainAddress = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: CreateBlockchainAddressInput,
    outputSchema: CreateBlockchainAddressOutput,
    errors: [BadRequest, NotFound] as const,
  }),
);
