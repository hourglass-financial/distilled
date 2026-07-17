import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface GetInboundBlockchainTransferInput {
  id: string;
  ereborVersion?: string;
}
export const GetInboundBlockchainTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/blockchain_in/{id}" }),
  ) as unknown as GeneratedStructCodec<GetInboundBlockchainTransferInput>;

// Output Schema
export interface GetInboundBlockchainTransferOutput {
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
export const GetInboundBlockchainTransferOutput =
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
  }) as unknown as GeneratedStructCodec<GetInboundBlockchainTransferOutput>;

// The operation
/**
 * Retrieve Inbound Blockchain Transfer
 *
 * Retrieve a specific Inbound Blockchain Transfer by ID
 *
 * @param id - Inbound blockchain transfer ID
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getInboundBlockchainTransfer =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: GetInboundBlockchainTransferInput,
    outputSchema: GetInboundBlockchainTransferOutput,
    errors: [BadRequest, NotFound] as const,
  }));
