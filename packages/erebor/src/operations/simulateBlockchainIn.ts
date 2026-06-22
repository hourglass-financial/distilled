import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden } from "../errors.ts";

// Input Schema
export const SimulateBlockchainInInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Idempotency-Key"),
    ),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
    deposit_account_id: Schema.String,
    amount: Schema.Struct({
      currency: Schema.Literals(["USAT", "USDC", "USDT"]),
      value: Schema.String,
    }),
    network: Schema.Literals(["BASE", "ETHEREUM", "INK", "SOLANA", "SUI"]),
  }).pipe(T.Http({ method: "POST", path: "/simulation/blockchain_in" }));
export type SimulateBlockchainInInput = typeof SimulateBlockchainInInput.Type;

// Output Schema
export const SimulateBlockchainInOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    deposit_account_id: Schema.String,
    amount: Schema.Struct({
      currency: Schema.Literals(["USAT", "USDC", "USDT"]),
      value: Schema.String,
    }),
    transaction_hash: Schema.String,
  });
export type SimulateBlockchainInOutput = typeof SimulateBlockchainInOutput.Type;

// The operation
/**
 * Simulate Inbound Blockchain Transfer
 *
 * Simulate an inbound blockchain transfer for testing purposes. This endpoint is only available in the sandbox environment.
 * Creates a new inbound blockchain transfer that will be processed as if it was received on-chain.
 *
 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 * @param Erebor-Version - Optional API version header. Use a date-based Erebor API version when you need to pin request behavior.
 */
export const simulateBlockchainIn = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: SimulateBlockchainInInput,
    outputSchema: SimulateBlockchainInOutput,
    errors: [BadRequest, Forbidden] as const,
  }),
);
