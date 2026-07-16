import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound, Conflict } from "../errors.ts";

// Input Schema
export interface UpdateInboundAchTransferInput {
  id: string;
  ereborVersion?: string;
  ereborIdempotencyKey?: string;
  custom_ref?: string;
  custom_fields?: Record<string, unknown>;
}
export const UpdateInboundAchTransferInput =
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
    T.Http({ method: "PATCH", path: "/ach_in/{id}" }),
  ) as unknown as Schema.Codec<UpdateInboundAchTransferInput>;

// Output Schema
export interface UpdateInboundAchTransferOutput {
  id: string;
  type: "ACH_IN";
  url: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  program_id?: string | null;
  status: "CREATED" | "PENDING" | "SETTLED" | "FAILED" | "RETURNED";
  deposit_account_id: string;
  amount: {
    currency: "USD";
    exponent: number;
    value: string;
    display_value: string;
  };
  direction: "CREDIT" | "DEBIT";
  sec_code:
    | "PPD"
    | "CCD"
    | "WEB"
    | "TEL"
    | "CTX"
    | "IAT"
    | "ARC"
    | "BOC"
    | "POP"
    | "RCK"
    | "POS"
    | "SHR"
    | "MTE"
    | "COR"
    | "CIE"
    | "DNE"
    | "ENR"
    | "ADV"
    | "ACK"
    | "ATX"
    | "PBR"
    | "TRC"
    | "TRX"
    | "XCK";
  company_entry_description: string;
  originating_company_id: string;
  originating_company_name: string;
  effective_entry_date: string;
  addenda: ReadonlyArray<string>;
  company_descriptive_date?: string | null;
  company_discretionary_data?: string | null;
  return_code?: string | null;
  returned_at?: string | null;
  custom_ref?: string | null;
  custom_fields?: Record<string, unknown> | null;
}
export const UpdateInboundAchTransferOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["ACH_IN"]),
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
    amount: Schema.Struct({
      currency: Schema.Literals(["USD"]),
      exponent: Schema.Number,
      value: Schema.String,
      display_value: Schema.String,
    }),
    direction: Schema.Literals(["CREDIT", "DEBIT"]),
    sec_code: Schema.Literals([
      "PPD",
      "CCD",
      "WEB",
      "TEL",
      "CTX",
      "IAT",
      "ARC",
      "BOC",
      "POP",
      "RCK",
      "POS",
      "SHR",
      "MTE",
      "COR",
      "CIE",
      "DNE",
      "ENR",
      "ADV",
      "ACK",
      "ATX",
      "PBR",
      "TRC",
      "TRX",
      "XCK",
    ]),
    company_entry_description: Schema.String,
    originating_company_id: Schema.String,
    originating_company_name: Schema.String,
    effective_entry_date: Schema.String,
    addenda: Schema.Array(Schema.String),
    company_descriptive_date: Schema.optional(Schema.NullOr(Schema.String)),
    company_discretionary_data: Schema.optional(Schema.NullOr(Schema.String)),
    return_code: Schema.optional(Schema.NullOr(Schema.String)),
    returned_at: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
    custom_fields: Schema.optional(
      Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
    ),
  }) as unknown as Schema.Codec<UpdateInboundAchTransferOutput>;

// The operation
/**
 * Update Inbound ACH Transfer
 *
 * Update an inbound ACH transfer's `custom_ref` or `custom_fields` for reconciliation. All other fields are immutable.
 *
 * @param id - Inbound ACH transfer ID
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const updateInboundAchTransfer = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: UpdateInboundAchTransferInput,
    outputSchema: UpdateInboundAchTransferOutput,
    errors: [BadRequest, NotFound, Conflict] as const,
  }),
);
