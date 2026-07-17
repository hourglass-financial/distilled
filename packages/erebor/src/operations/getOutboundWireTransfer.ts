import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface GetOutboundWireTransferInput {
  id: string;
  ereborVersion?: string;
}
export const GetOutboundWireTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/wire_out/{id}" }),
  ) as unknown as GeneratedStructCodec<GetOutboundWireTransferInput>;

// Output Schema
export interface GetOutboundWireTransferOutput {
  id: string;
  type: "WIRE_OUT";
  url: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  program_id?: string | null;
  status: "CREATED" | "PENDING" | "SETTLED" | "FAILED" | "RETURNED";
  deposit_account_id: string;
  counterparty_us_bank_account_id: string;
  bank_name?: string | null;
  creditor_routing_number?: string;
  creditor_account_number?: string;
  creditor_name?: string;
  amount: {
    currency: "USD";
    exponent: number;
    value: string;
    display_value: string;
  };
  end_to_end_id: string;
  imad: string;
  instruction_id: string;
  uetr: string;
  memo?: string | null;
  custom_ref?: string | null;
  custom_fields?: Record<string, unknown> | null;
}
export const GetOutboundWireTransferOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["WIRE_OUT"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    program_id: Schema.optional(Schema.NullOr(Schema.String)),
    status: Schema.Literals([
      "CREATED",
      "PENDING",
      "SETTLED",
      "FAILED",
      "RETURNED",
    ]),
    deposit_account_id: Schema.String,
    counterparty_us_bank_account_id: Schema.String,
    bank_name: Schema.optional(Schema.NullOr(Schema.String)),
    creditor_routing_number: Schema.optional(Schema.String),
    creditor_account_number: Schema.optional(Schema.String),
    creditor_name: Schema.optional(Schema.String),
    amount: Schema.Struct({
      currency: Schema.Literals(["USD"]),
      exponent: Schema.Number,
      value: Schema.String,
      display_value: Schema.String,
    }),
    end_to_end_id: Schema.String,
    imad: Schema.String,
    instruction_id: Schema.String,
    uetr: Schema.String,
    memo: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
    custom_fields: Schema.optional(
      Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
    ),
  }) as unknown as GeneratedStructCodec<GetOutboundWireTransferOutput>;

// The operation
/**
 * Retrieve Outbound Wire Transfer
 *
 * Retrieve a specific Outbound Wire Transfer by ID
 *
 * @param id - Outbound wire transfer ID
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getOutboundWireTransfer = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: GetOutboundWireTransferInput,
    outputSchema: GetOutboundWireTransferOutput,
    errors: [BadRequest, NotFound] as const,
  }),
);
