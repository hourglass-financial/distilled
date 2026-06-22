import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden } from "../errors.ts";

// Input Schema
export const SimulateAchInInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Idempotency-Key"),
  ),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
  deposit_account_id: Schema.optional(Schema.String),
  account_number: Schema.optional(Schema.String),
  routing_number: Schema.optional(Schema.String),
  amount: Schema.Struct({
    currency: Schema.Literals(["USD"]),
    value: Schema.String,
  }),
  addenda: Schema.optional(Schema.NullOr(Schema.Array(Schema.String))),
}).pipe(T.Http({ method: "POST", path: "/simulation/ach_in" }));
export type SimulateAchInInput = typeof SimulateAchInInput.Type;

// Output Schema
export const SimulateAchInOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  deposit_account_id: Schema.String,
  amount: Schema.Struct({
    currency: Schema.Literals(["USD"]),
    value: Schema.String,
  }),
});
export type SimulateAchInOutput = typeof SimulateAchInOutput.Type;

// The operation
/**
 * Simulate Inbound ACH Transfer
 *
 * Simulate an inbound ACH transfer for testing purposes. This endpoint is only available in the sandbox environment.
 * Creates a new inbound ACH transfer that will be processed as if it was received via the ACH network. You can identify the destination account using either a `deposit_account_id` or an `account_number` + `routing_number` pair — provide exactly one.
 *
 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 * @param Erebor-Version - Optional API version header. Use a date-based Erebor API version when you need to pin request behavior.
 */
export const simulateAchIn = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: SimulateAchInInput,
  outputSchema: SimulateAchInOutput,
  errors: [BadRequest, Forbidden] as const,
}));
