import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound, Conflict } from "../errors.ts";

// Input Schema
export interface UpdateOutboundRailTransferInput {
  id: string;
  ereborVersion?: string;
  ereborIdempotencyKey?: string;
  custom_ref?: string;
  custom_fields?: Record<string, unknown>;
}
export const UpdateOutboundRailTransferInput =
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
    T.Http({ method: "PATCH", path: "/rail_out/{id}" }),
  ) as unknown as Schema.Codec<UpdateOutboundRailTransferInput>;

// Output Schema
export interface UpdateOutboundRailTransferOutput {
  id: string;
  type: "RAIL_OUT";
  url: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  program_id?: string | null;
  status: "CREATED" | "PENDING" | "SETTLED" | "FAILED";
  from_deposit_account_id: string;
  counterparty_rail_address_id?: string | null;
  to_deposit_account_id?: string | null;
  amount: {
    currency: "USD";
    exponent: number;
    value: string;
    display_value: string;
  };
  memo?: string | null;
  internal_note?: string | null;
  custom_ref?: string | null;
  custom_fields?: Record<string, unknown> | null;
}
export const UpdateOutboundRailTransferOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["RAIL_OUT"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    program_id: Schema.optional(Schema.NullOr(Schema.String)),
    status: Schema.Literals(["CREATED", "PENDING", "SETTLED", "FAILED"]),
    from_deposit_account_id: Schema.String,
    counterparty_rail_address_id: Schema.optional(Schema.NullOr(Schema.String)),
    to_deposit_account_id: Schema.optional(Schema.NullOr(Schema.String)),
    amount: Schema.Struct({
      currency: Schema.Literals(["USD"]),
      exponent: Schema.Number,
      value: Schema.String,
      display_value: Schema.String,
    }),
    memo: Schema.optional(Schema.NullOr(Schema.String)),
    internal_note: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
    custom_fields: Schema.optional(
      Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
    ),
  }) as unknown as Schema.Codec<UpdateOutboundRailTransferOutput>;

// The operation
/**
 * Update Outbound Rail Transfer
 *
 * Update an outbound rail transfer's `custom_ref` or `custom_fields`. Amount, parties, and status are immutable.
 *
 * @param id - Outbound Rail transfer ID
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const updateOutboundRailTransfer = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: UpdateOutboundRailTransferInput,
    outputSchema: UpdateOutboundRailTransferOutput,
    errors: [BadRequest, NotFound, Conflict] as const,
  }),
);
