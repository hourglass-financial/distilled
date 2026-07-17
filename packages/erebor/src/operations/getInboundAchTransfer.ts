import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface GetInboundAchTransferInput {
  id: string;
  ereborVersion?: string;
}
export const GetInboundAchTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/ach_in/{id}" }),
  ) as unknown as GeneratedStructCodec<GetInboundAchTransferInput>;

// Output Schema
export interface GetInboundAchTransferOutput {
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
export const GetInboundAchTransferOutput =
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
  }) as unknown as GeneratedStructCodec<GetInboundAchTransferOutput>;

// The operation
/**
 * Retrieve Inbound ACH Transfer
 *
 * Retrieve a specific Inbound ACH Transfer by ID
 *
 * @param id - Inbound ACH transfer ID
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getInboundAchTransfer = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: GetInboundAchTransferInput,
    outputSchema: GetInboundAchTransferOutput,
    errors: [BadRequest, NotFound] as const,
  }),
);
