import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface GetOutboundAchTransferInput {
  id: string;
  ereborVersion?: string;
}
export const GetOutboundAchTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/ach_out/{id}" }),
  ) as unknown as Schema.Codec<GetOutboundAchTransferInput>;

// Output Schema
export interface GetOutboundAchTransferOutput {
  id: string;
  type: "ACH_OUT";
  url: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  program_id?: string | null;
  status: "CREATED" | "PENDING" | "SETTLED" | "FAILED" | "RETURNED";
  deposit_account_id: string;
  counterparty_us_bank_account_id: string;
  amount: {
    currency: "USD";
    exponent: number;
    value: string;
    display_value: string;
  };
  direction: "CREDIT" | "DEBIT";
  sec_code: "CCD" | "PPD" | "WEB";
  company_entry_description: string;
  effective_entry_date?: string | null;
  addenda: ReadonlyArray<string>;
  company_discretionary_data?: string | null;
  service: "SAME_DAY" | "STANDARD";
  custom_ref?: string | null;
  custom_fields?: Record<string, unknown> | null;
  return_code?: string | null;
  returned_at?: string | null;
}
export const GetOutboundAchTransferOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["ACH_OUT"]),
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
    amount: Schema.Struct({
      currency: Schema.Literals(["USD"]),
      exponent: Schema.Number,
      value: Schema.String,
      display_value: Schema.String,
    }),
    direction: Schema.Literals(["CREDIT", "DEBIT"]),
    sec_code: Schema.Literals(["CCD", "PPD", "WEB"]),
    company_entry_description: Schema.String,
    effective_entry_date: Schema.optional(Schema.NullOr(Schema.String)),
    addenda: Schema.Array(Schema.String),
    company_discretionary_data: Schema.optional(Schema.NullOr(Schema.String)),
    service: Schema.Literals(["SAME_DAY", "STANDARD"]),
    custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
    custom_fields: Schema.optional(
      Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
    ),
    return_code: Schema.optional(Schema.NullOr(Schema.String)),
    returned_at: Schema.optional(Schema.NullOr(Schema.String)),
  }) as unknown as Schema.Codec<GetOutboundAchTransferOutput>;

// The operation
/**
 * Retrieve Outbound ACH Transfer
 *
 * Retrieve a specific Outbound ACH Transfer by ID
 *
 * @param id - Outbound ACH transfer ID
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getOutboundAchTransfer = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: GetOutboundAchTransferInput,
    outputSchema: GetOutboundAchTransferOutput,
    errors: [BadRequest, NotFound] as const,
  }),
);
