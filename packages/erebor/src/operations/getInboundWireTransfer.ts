import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface GetInboundWireTransferInput {
  id: string;
  ereborVersion?: string;
}
export const GetInboundWireTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/wire_in/{id}" }),
  ) as unknown as GeneratedStructCodec<GetInboundWireTransferInput>;

// Output Schema
export interface GetInboundWireTransferOutput {
  id: string;
  type: "WIRE_IN";
  url: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  program_id?: string | null;
  status:
    | "CREATED"
    | "PENDING"
    | "SETTLED"
    | "FAILED"
    | "RETURNED"
    | "RESOLVING_FROM_SUSPENSE";
  counterparty_us_bank_account_id: string;
  deposit_account_id: string;
  bank_name?: string | null;
  debtor_routing_number?: string | null;
  debtor_account_number?: string | null;
  debtor_name?: string | null;
  creditor_name?: string | null;
  amount: {
    currency: "USD";
    exponent: number;
    value: string;
    display_value: string;
  };
  end_to_end_id: string;
  imad: string;
  uetr: string;
  instruction_id: string | null;
  memo?: string | null;
  custom_ref?: string | null;
  custom_fields?: Record<string, unknown> | null;
}
export const GetInboundWireTransferOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["WIRE_IN"]),
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
      "RESOLVING_FROM_SUSPENSE",
    ]),
    counterparty_us_bank_account_id: Schema.String,
    deposit_account_id: Schema.String,
    bank_name: Schema.optional(Schema.NullOr(Schema.String)),
    debtor_routing_number: Schema.optional(Schema.NullOr(Schema.String)),
    debtor_account_number: Schema.optional(Schema.NullOr(Schema.String)),
    debtor_name: Schema.optional(Schema.NullOr(Schema.String)),
    creditor_name: Schema.optional(Schema.NullOr(Schema.String)),
    amount: Schema.Struct({
      currency: Schema.Literals(["USD"]),
      exponent: Schema.Number,
      value: Schema.String,
      display_value: Schema.String,
    }),
    end_to_end_id: Schema.String,
    imad: Schema.String,
    uetr: Schema.String,
    instruction_id: Schema.NullOr(Schema.String),
    memo: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
    custom_fields: Schema.optional(
      Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
    ),
  }) as unknown as GeneratedStructCodec<GetInboundWireTransferOutput>;

// The operation
/**
 * Retrieve Inbound Wire Transfer
 *
 * Retrieve a specific Inbound Wire Transfer by ID
 *
 * @param id - Inbound wire transfer ID
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getInboundWireTransfer = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: GetInboundWireTransferInput,
    outputSchema: GetInboundWireTransferOutput,
    errors: [BadRequest, NotFound] as const,
  }),
);
