import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound, Conflict } from "../errors.ts";

// Input Schema
export interface UpdateInboundRailTransferInput {
  id: string;
  ereborVersion?: string;
  ereborIdempotencyKey?: string;
  custom_ref?: string;
  custom_fields?: Record<string, unknown>;
}
export const UpdateInboundRailTransferInput =
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
    T.Http({ method: "PATCH", path: "/rail_in/{id}" }),
  ) as unknown as GeneratedStructCodec<UpdateInboundRailTransferInput>;

// Output Schema
export interface UpdateInboundRailTransferOutput {
  id: string;
  type: "RAIL_IN";
  url: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  program_id?: string | null;
  status: "CREATED" | "PENDING" | "SETTLED" | "FAILED";
  to_deposit_account_id: string;
  from_deposit_account_id?: string | null;
  counterparty_rail_address_id?: string | null;
  amount: {
    currency: "USD";
    exponent: number;
    value: string;
    display_value: string;
  };
  memo?: string | null;
  custom_ref?: string | null;
  custom_fields?: Record<string, unknown> | null;
}
export const UpdateInboundRailTransferOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["RAIL_IN"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    program_id: Schema.optional(Schema.NullOr(Schema.String)),
    status: Schema.Literals(["CREATED", "PENDING", "SETTLED", "FAILED"]),
    to_deposit_account_id: Schema.String,
    from_deposit_account_id: Schema.optional(Schema.NullOr(Schema.String)),
    counterparty_rail_address_id: Schema.optional(Schema.NullOr(Schema.String)),
    amount: Schema.Struct({
      currency: Schema.Literals(["USD"]),
      exponent: Schema.Number,
      value: Schema.String,
      display_value: Schema.String,
    }),
    memo: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
    custom_fields: Schema.optional(
      Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
    ),
  }) as unknown as GeneratedStructCodec<UpdateInboundRailTransferOutput>;

// The operation
/**
 * Update Inbound Rail Transfer
 *
 * Update an inbound rail transfer's `custom_ref` or `custom_fields` for reconciliation. All other fields are immutable.
 *
 * @param id - Inbound Rail transfer ID
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param ereborIdempotencyKey - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const updateInboundRailTransfer = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: UpdateInboundRailTransferInput,
    outputSchema: UpdateInboundRailTransferOutput,
    errors: [BadRequest, NotFound, Conflict] as const,
  }),
);
