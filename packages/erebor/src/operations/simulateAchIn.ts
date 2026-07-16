import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, Conflict } from "../errors.ts";

// Input Schema
export interface SimulateAchInInput {
  ereborVersion?: string;
  ereborIdempotencyKey?: string;
  deposit_account_id?: string;
  account_number?: string;
  routing_number?: string;
  amount: { currency: "USD"; value: string };
  addenda?: ReadonlyArray<string> | null;
}
export const SimulateAchInInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
  ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Idempotency-Key"),
  ),
  deposit_account_id: Schema.optional(Schema.String),
  account_number: Schema.optional(Schema.String),
  routing_number: Schema.optional(Schema.String),
  amount: Schema.Struct({
    currency: Schema.Literals(["USD"]),
    value: Schema.String,
  }),
  addenda: Schema.optional(Schema.NullOr(Schema.Array(Schema.String))),
}).pipe(
  T.Http({ method: "POST", path: "/simulation/ach_in" }),
) as unknown as Schema.Codec<SimulateAchInInput>;

// Output Schema
export interface SimulateAchInOutput {
  deposit_account_id: string;
  amount: { currency: "USD"; value: string };
}
export const SimulateAchInOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  deposit_account_id: Schema.String,
  amount: Schema.Struct({
    currency: Schema.Literals(["USD"]),
    value: Schema.String,
  }),
}) as unknown as Schema.Codec<SimulateAchInOutput>;

// The operation
/**
 * Simulate Inbound ACH Transfer
 *
 * Simulate an inbound ACH transfer for testing purposes. This endpoint is only available in the sandbox environment.
 * Creates a new inbound ACH transfer that will be processed as if it was received via the ACH network. You can identify the destination account using either a `deposit_account_id` or an `account_number` + `routing_number` pair — provide exactly one.
 *
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const simulateAchIn = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: SimulateAchInInput,
  outputSchema: SimulateAchInOutput,
  errors: [BadRequest, Forbidden, Conflict] as const,
}));
