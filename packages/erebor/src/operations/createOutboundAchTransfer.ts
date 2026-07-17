import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, Conflict } from "../errors.ts";

// Input Schema
export interface CreateOutboundAchTransferInput {
  ereborVersion?: string;
  ereborIdempotencyKey?: string;
  deposit_account_id: string;
  counterparty_us_bank_account_id: string;
  amount: { currency: "USD"; value: string };
  direction: "CREDIT" | "DEBIT";
  sec_code: "CCD" | "PPD" | "WEB";
  company_entry_description: string;
  company_discretionary_data?: string;
  addenda?: ReadonlyArray<string> | null;
  service?: "SAME_DAY" | "STANDARD";
  custom_ref?: string;
  custom_fields?: Record<string, unknown>;
}
export const CreateOutboundAchTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
    ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Idempotency-Key"),
    ),
    deposit_account_id: Schema.String,
    counterparty_us_bank_account_id: Schema.String,
    amount: Schema.Struct({
      currency: Schema.Literals(["USD"]),
      value: Schema.String,
    }),
    direction: Schema.Literals(["CREDIT", "DEBIT"]),
    sec_code: Schema.Literals(["CCD", "PPD", "WEB"]),
    company_entry_description: Schema.String,
    company_discretionary_data: Schema.optional(Schema.String),
    addenda: Schema.optional(Schema.NullOr(Schema.Array(Schema.String))),
    service: Schema.optional(Schema.Literals(["SAME_DAY", "STANDARD"])),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(
    T.Http({ method: "POST", path: "/ach_out" }),
  ) as unknown as GeneratedStructCodec<CreateOutboundAchTransferInput>;

// Output Schema
export interface CreateOutboundAchTransferOutput {
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
export const CreateOutboundAchTransferOutput =
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
  }) as unknown as GeneratedStructCodec<CreateOutboundAchTransferOutput>;

// The operation
/**
 * Create Outbound ACH Transfer
 *
 * Create a new Outbound ACH Transfer
 *
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param ereborIdempotencyKey - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const createOutboundAchTransfer = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: CreateOutboundAchTransferInput,
    outputSchema: CreateOutboundAchTransferOutput,
    errors: [BadRequest, Conflict] as const,
  }),
);
