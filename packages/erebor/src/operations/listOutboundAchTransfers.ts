import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";

// Input Schema
export interface ListOutboundAchTransfersInput {
  page_size?: number;
  starting_after?: string;
  ending_before?: string;
  deposit_account_id?: string;
  status?: "CREATED" | "PENDING" | "SETTLED" | "FAILED" | "RETURNED";
  customer_id?: string;
  program_id?: string;
  custom_ref?: string;
  ereborVersion?: string;
}
export const ListOutboundAchTransfersInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    page_size: Schema.optional(Schema.Number).pipe(T.HttpQuery("page_size")),
    starting_after: Schema.optional(Schema.String).pipe(
      T.HttpQuery("starting_after"),
    ),
    ending_before: Schema.optional(Schema.String).pipe(
      T.HttpQuery("ending_before"),
    ),
    deposit_account_id: Schema.optional(Schema.String).pipe(
      T.HttpQuery("deposit_account_id"),
    ),
    status: Schema.optional(
      Schema.Literals(["CREATED", "PENDING", "SETTLED", "FAILED", "RETURNED"]),
    ).pipe(T.HttpQuery("status")),
    customer_id: Schema.optional(Schema.String).pipe(
      T.HttpQuery("customer_id"),
    ),
    program_id: Schema.optional(Schema.String).pipe(T.HttpQuery("program_id")),
    custom_ref: Schema.optional(Schema.String).pipe(T.HttpQuery("custom_ref")),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/ach_out" }),
  ) as unknown as GeneratedStructCodec<ListOutboundAchTransfersInput>;

// Output Schema
export interface ListOutboundAchTransfersOutput {
  data: ReadonlyArray<{
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
  }>;
  has_more: boolean;
  page_size: number;
  page_next?: string | null;
  page_prev?: string | null;
  url: string;
}
export const ListOutboundAchTransfersOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
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
        company_discretionary_data: Schema.optional(
          Schema.NullOr(Schema.String),
        ),
        service: Schema.Literals(["SAME_DAY", "STANDARD"]),
        custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
        custom_fields: Schema.optional(
          Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
        ),
        return_code: Schema.optional(Schema.NullOr(Schema.String)),
        returned_at: Schema.optional(Schema.NullOr(Schema.String)),
      }),
    ),
    has_more: Schema.Boolean,
    page_size: Schema.Number,
    page_next: Schema.optional(Schema.NullOr(Schema.String)),
    page_prev: Schema.optional(Schema.NullOr(Schema.String)),
    url: Schema.String,
  }) as unknown as GeneratedStructCodec<ListOutboundAchTransfersOutput>;

// The operation
/**
 * List Outbound ACH Transfers
 *
 * Retrieve a paginated list of Outbound ACH Transfers
 *
 * @param page_size - Number of items per page (max 100)
 * @param starting_after - Cursor for pagination (exclusive start)
 * @param ending_before - Cursor for pagination (exclusive end)
 * @param deposit_account_id - Filter by deposit account ID
 * @param status - Filter by transfer status
 * @param customer_id - Filter by customer ID
 * @param program_id - Filter by program ID
 * @param custom_ref - Filter by exact `custom_ref` match (case-sensitive, up to 255 characters).
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const listOutboundAchTransfers = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: ListOutboundAchTransfersInput,
    outputSchema: ListOutboundAchTransfersOutput,
  }),
);
