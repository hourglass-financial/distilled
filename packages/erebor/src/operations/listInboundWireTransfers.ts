import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";

// Input Schema
export interface ListInboundWireTransfersInput {
  page_size?: number;
  starting_after?: string;
  ending_before?: string;
  deposit_account_id?: string;
  status?:
    | "CREATED"
    | "PENDING"
    | "SETTLED"
    | "FAILED"
    | "RETURNED"
    | "RESOLVING_FROM_SUSPENSE";
  customer_id?: string;
  program_id?: string;
  custom_ref?: string;
  ereborVersion?: string;
}
export const ListInboundWireTransfersInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    page_size: Schema.optional(Schema.Number),
    starting_after: Schema.optional(Schema.String),
    ending_before: Schema.optional(Schema.String),
    deposit_account_id: Schema.optional(Schema.String),
    status: Schema.optional(
      Schema.Literals([
        "CREATED",
        "PENDING",
        "SETTLED",
        "FAILED",
        "RETURNED",
        "RESOLVING_FROM_SUSPENSE",
      ]),
    ),
    customer_id: Schema.optional(Schema.String),
    program_id: Schema.optional(Schema.String),
    custom_ref: Schema.optional(Schema.String),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/wire_in" }),
  ) as unknown as Schema.Codec<ListInboundWireTransfersInput>;

// Output Schema
export interface ListInboundWireTransfersOutput {
  data: ReadonlyArray<{
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
  }>;
  has_more: boolean;
  page_size: number;
  page_next?: string | null;
  page_prev?: string | null;
  url: string;
}
export const ListInboundWireTransfersOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
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
      }),
    ),
    has_more: Schema.Boolean,
    page_size: Schema.Number,
    page_next: Schema.optional(Schema.NullOr(Schema.String)),
    page_prev: Schema.optional(Schema.NullOr(Schema.String)),
    url: Schema.String,
  }) as unknown as Schema.Codec<ListInboundWireTransfersOutput>;

// The operation
/**
 * List Inbound Wire Transfers
 *
 * Retrieve a paginated list of Inbound Wire Transfers
 *
 * @param page_size - Number of items per page (max 100)
 * @param starting_after - Cursor for pagination (exclusive start)
 * @param ending_before - Cursor for pagination (exclusive end)
 * @param deposit_account_id - Filter by deposit account ID
 * @param status - Filter by transfer status
 * @param customer_id - Filter by customer ID
 * @param program_id - Filter by program ID
 * @param custom_ref - Filter by exact `custom_ref` match (case-sensitive, up to 255 characters).
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const listInboundWireTransfers = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: ListInboundWireTransfersInput,
    outputSchema: ListInboundWireTransfersOutput,
  }),
);
