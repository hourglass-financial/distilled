import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, Conflict } from "../errors.ts";

// Input Schema
export interface SimulateBlockchainInInput {
  ereborVersion?: string;
  ereborIdempotencyKey?: string;
  deposit_account_id: string;
  amount: { currency: "USAT" | "USDC" | "USDT"; value: string };
  network: "BASE" | "ETHEREUM" | "INK" | "SOLANA" | "SUI";
}
export const SimulateBlockchainInInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
    ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Idempotency-Key"),
    ),
    deposit_account_id: Schema.String,
    amount: Schema.Struct({
      currency: Schema.Literals(["USAT", "USDC", "USDT"]),
      value: Schema.String,
    }),
    network: Schema.Literals(["BASE", "ETHEREUM", "INK", "SOLANA", "SUI"]),
  }).pipe(
    T.Http({ method: "POST", path: "/simulation/blockchain_in" }),
  ) as unknown as Schema.Codec<SimulateBlockchainInInput>;

// Output Schema
export interface SimulateBlockchainInOutput {
  deposit_account_id: string;
  amount: { currency: "USAT" | "USDC" | "USDT"; value: string };
  transaction_hash: string;
}
export const SimulateBlockchainInOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    deposit_account_id: Schema.String,
    amount: Schema.Struct({
      currency: Schema.Literals(["USAT", "USDC", "USDT"]),
      value: Schema.String,
    }),
    transaction_hash: Schema.String,
  }) as unknown as Schema.Codec<SimulateBlockchainInOutput>;

// The operation
/**
 * Simulate Inbound Blockchain Transfer
 *
 * Simulate an inbound blockchain transfer for testing purposes. This endpoint is only available in the sandbox environment.
 * Creates a new inbound blockchain transfer that will be processed as if it was received on-chain.
 *
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const simulateBlockchainIn = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: SimulateBlockchainInInput,
    outputSchema: SimulateBlockchainInOutput,
    errors: [BadRequest, Forbidden, Conflict] as const,
  }),
);
