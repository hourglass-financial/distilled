import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const UpdateBlockchainAddressInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    name: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(T.Http({ method: "PATCH", path: "/blockchain_addresses/{id}" }));
export type UpdateBlockchainAddressInput =
  typeof UpdateBlockchainAddressInput.Type;

// Output Schema
export const UpdateBlockchainAddressOutput =
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
export type UpdateBlockchainAddressOutput =
  typeof UpdateBlockchainAddressOutput.Type;

// The operation
/**
 * Update Blockchain Address
 *
 * Update a blockchain address's `name`, `custom_ref`, or `custom_fields`. The on-chain address, address type, and network set are immutable.
 *
 * @param id - Blockchain address ID
 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const updateBlockchainAddress = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: UpdateBlockchainAddressInput,
    outputSchema: UpdateBlockchainAddressOutput,
    errors: [BadRequest, NotFound] as const,
  }),
);
