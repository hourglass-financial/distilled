import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface GetOutboundInternationalWireTransferInput {
  id: string;
  ereborVersion?: string;
}
export const GetOutboundInternationalWireTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/international_wire_out/{id}" }),
  ) as unknown as GeneratedStructCodec<GetOutboundInternationalWireTransferInput>;

// Output Schema
export interface GetOutboundInternationalWireTransferOutput {
  id: string;
  type: "INTERNATIONAL_WIRE_OUT";
  url: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  program_id?: string | null;
  status: "CREATED" | "PENDING" | "SETTLED" | "FAILED" | "RETURNED";
  deposit_account_id: string;
  counterparty_international_bank_account_id: string;
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
export const GetOutboundInternationalWireTransferOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["INTERNATIONAL_WIRE_OUT"]),
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
    counterparty_international_bank_account_id: Schema.String,
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
  }) as unknown as GeneratedStructCodec<GetOutboundInternationalWireTransferOutput>;

// The operation
/**
 * Retrieve Outbound International Wire
 *
 * Retrieve a specific Outbound International Wire by ID
 *
 * @param id - Outbound International Wire ID
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getOutboundInternationalWireTransfer =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: GetOutboundInternationalWireTransferInput,
    outputSchema: GetOutboundInternationalWireTransferOutput,
    errors: [BadRequest, NotFound] as const,
  }));
