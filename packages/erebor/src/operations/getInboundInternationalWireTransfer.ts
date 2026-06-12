import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const GetInboundInternationalWireTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
  }).pipe(T.Http({ method: "GET", path: "/international_wire_in/{id}" }));
export type GetInboundInternationalWireTransferInput =
  typeof GetInboundInternationalWireTransferInput.Type;

// Output Schema
export const GetInboundInternationalWireTransferOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["INTERNATIONAL_WIRE_IN"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    program_id: Schema.optional(Schema.NullOr(Schema.String)),
    status: Schema.Literals(["PENDING", "SETTLED", "FAILED", "RETURNED"]),
    counterparty_international_bank_account_id: Schema.String,
    deposit_account_id: Schema.String,
    amount: Schema.Struct({
      currency: Schema.Literals(["USD"]),
      exponent: Schema.Number,
      value: Schema.String,
      display_value: Schema.String,
    }),
    memo: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.Unknown),
    custom_fields: Schema.optional(Schema.Unknown),
  });
export type GetInboundInternationalWireTransferOutput =
  typeof GetInboundInternationalWireTransferOutput.Type;

// The operation
/**
 * Retrieve Inbound International Wire
 *
 * Retrieve a specific Inbound International Wire by ID
 *
 * @param id - Inbound International Wire ID
 */
export const getInboundInternationalWireTransfer =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: GetInboundInternationalWireTransferInput,
    outputSchema: GetInboundInternationalWireTransferOutput,
    errors: [BadRequest, NotFound] as const,
  }));
