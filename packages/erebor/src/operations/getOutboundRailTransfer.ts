import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface GetOutboundRailTransferInput {
  id: string;
  ereborVersion?: string;
}
export const GetOutboundRailTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/rail_out/{id}" }),
  ) as unknown as GeneratedStructCodec<GetOutboundRailTransferInput>;

// Output Schema
export interface GetOutboundRailTransferOutput {
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
export const GetOutboundRailTransferOutput =
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
  }) as unknown as GeneratedStructCodec<GetOutboundRailTransferOutput>;

// The operation
/**
 * Retrieve Outbound Rail Transfer
 *
 * Retrieve a specific Outbound Rail Transfer by ID
 *
 * @param id - Outbound Rail Transfer ID
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getOutboundRailTransfer = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: GetOutboundRailTransferInput,
    outputSchema: GetOutboundRailTransferOutput,
    errors: [BadRequest, NotFound] as const,
  }),
);
