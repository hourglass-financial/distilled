import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, Forbidden, Conflict } from "../errors.ts";

// Input Schema
export interface SimulateInternationalWireInInput {
  ereborVersion?: string;
  ereborIdempotencyKey?: string;
  deposit_account_id?: string;
  account_number?: string;
  routing_number?: string;
  amount: { currency: "USD"; value: string };
  originator_name: string;
  originator_account_number: string;
  originator_bic: string;
  originator_additional_account_number_data?: {
    canada?: {
      institution_number: string;
      transit_number: string;
      account_number?: string;
    } | null;
  };
  memo?: string | null;
}
export const SimulateInternationalWireInInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
    originator_name: Schema.String,
    originator_account_number: Schema.String,
    originator_bic: Schema.String,
    originator_additional_account_number_data: Schema.optional(
      Schema.Struct({
        canada: Schema.optional(
          Schema.NullOr(
            Schema.Struct({
              institution_number: Schema.String,
              transit_number: Schema.String,
              account_number: Schema.optional(Schema.String),
            }),
          ),
        ),
      }),
    ),
    memo: Schema.optional(Schema.NullOr(Schema.String)),
  }).pipe(
    T.Http({ method: "POST", path: "/simulation/international_wire_in" }),
  ) as unknown as GeneratedStructCodec<SimulateInternationalWireInInput>;

// Output Schema
export interface SimulateInternationalWireInOutput {
  international_wire_in_id: string;
  deposit_account_id: string;
  amount: { currency: "USD"; value: string };
  status: "CREATED" | "PENDING" | "SETTLED" | "FAILED" | "RETURNED";
}
export const SimulateInternationalWireInOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    international_wire_in_id: Schema.String,
    deposit_account_id: Schema.String,
    amount: Schema.Struct({
      currency: Schema.Literals(["USD"]),
      value: Schema.String,
    }),
    status: Schema.Literals([
      "CREATED",
      "PENDING",
      "SETTLED",
      "FAILED",
      "RETURNED",
    ]),
  }) as unknown as GeneratedStructCodec<SimulateInternationalWireInOutput>;

// The operation
/**
 * Simulate Inbound International Wire Transfer
 *
 * Simulate an inbound international wire transfer for testing purposes. This endpoint is only available in the sandbox environment.
 * You can identify the destination account using either a `deposit_account_id` or an `account_number` + `routing_number` pair — provide exactly one. The originator fields synthesize the sending bank/account; the simulation get-or-creates a counterparty international bank account from these so subsequent counterparty list/get calls observe the new sender. USD-only on day 1.
 * The response returns the new transfer's customer-facing ID with status `PENDING`. Settlement (`SETTLED`) is asynchronous — typically within seconds. Poll `GET /international_wire_in/{international_wire_in_id}` or listen for the `INTERNATIONAL_WIRE_IN.SETTLED` webhook to observe the transition.
 * Idempotency: when retrying with the same `Erebor-Idempotency-Key`, the response reflects the existing row's current status (`PENDING` or `SETTLED`). A key reused across customers returns `409 Conflict` — regenerate the key.
 *
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param ereborIdempotencyKey - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const simulateInternationalWireIn = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: SimulateInternationalWireInInput,
    outputSchema: SimulateInternationalWireInOutput,
    errors: [BadRequest, Forbidden, Conflict] as const,
  }),
);
