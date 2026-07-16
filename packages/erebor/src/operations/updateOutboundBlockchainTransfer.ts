import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound, Conflict } from "../errors.ts";

// Input Schema
export interface UpdateOutboundBlockchainTransferInput {
  id: string;
  ereborVersion?: string;
  ereborIdempotencyKey?: string;
  custom_ref?: string;
  custom_fields?: Record<string, unknown>;
}
export const UpdateOutboundBlockchainTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
    ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Idempotency-Key"),
    ),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(
    T.Http({ method: "PATCH", path: "/blockchain_out/{id}" }),
  ) as unknown as Schema.Codec<UpdateOutboundBlockchainTransferInput>;

// Output Schema
export interface UpdateOutboundBlockchainTransferOutput {
  id: string;
  type: "BLOCKCHAIN_OUT";
  url: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  program_id?: string | null;
  status: "CREATED" | "PENDING" | "SETTLED" | "FAILED";
  deposit_account_id: string;
  counterparty_blockchain_address_id: string;
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
export const UpdateOutboundBlockchainTransferOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["BLOCKCHAIN_OUT"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    program_id: Schema.optional(Schema.NullOr(Schema.String)),
    status: Schema.Literals(["CREATED", "PENDING", "SETTLED", "FAILED"]),
    deposit_account_id: Schema.String,
    counterparty_blockchain_address_id: Schema.String,
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
  }) as unknown as Schema.Codec<UpdateOutboundBlockchainTransferOutput>;

// The operation
/**
 * Update Outbound Blockchain Transfer
 *
 * Update an outbound blockchain transfer's `custom_ref` or `custom_fields`. Amount, parties, network, and status are immutable.
 *
 * @param id - Outbound blockchain transfer ID
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const updateOutboundBlockchainTransfer =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: UpdateOutboundBlockchainTransferInput,
    outputSchema: UpdateOutboundBlockchainTransferOutput,
    errors: [BadRequest, NotFound, Conflict] as const,
  }));
