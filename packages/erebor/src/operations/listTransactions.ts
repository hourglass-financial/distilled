import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";

// Input Schema
export interface ListTransactionsInput {
  page_size?: number;
  starting_after?: string;
  ending_before?: string;
  account_id?: string;
  from_id?: string;
  to_id?: string;
  transaction_type?:
    | "ACH_IN"
    | "ACH_OUT"
    | "WIRE_IN"
    | "WIRE_OUT"
    | "INTERNATIONAL_WIRE_IN"
    | "INTERNATIONAL_WIRE_OUT"
    | "BLOCKCHAIN_IN"
    | "BLOCKCHAIN_OUT"
    | "RAIL_IN"
    | "RAIL_OUT"
    | "BOOK_TRANSFER"
    | "INTEREST"
    | "FEE"
    | "ADJUSTMENT";
  status?: "CREATED" | "PENDING" | "SETTLED" | "FAILED" | "REVERSED";
  associated_payment_id?: string;
  ereborVersion?: string;
}
export const ListTransactionsInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  page_size: Schema.optional(Schema.Number).pipe(T.HttpQuery("page_size")),
  starting_after: Schema.optional(Schema.String).pipe(
    T.HttpQuery("starting_after"),
  ),
  ending_before: Schema.optional(Schema.String).pipe(
    T.HttpQuery("ending_before"),
  ),
  account_id: Schema.optional(Schema.String).pipe(T.HttpQuery("account_id")),
  from_id: Schema.optional(Schema.String).pipe(T.HttpQuery("from_id")),
  to_id: Schema.optional(Schema.String).pipe(T.HttpQuery("to_id")),
  transaction_type: Schema.optional(
    Schema.Literals([
      "ACH_IN",
      "ACH_OUT",
      "WIRE_IN",
      "WIRE_OUT",
      "INTERNATIONAL_WIRE_IN",
      "INTERNATIONAL_WIRE_OUT",
      "BLOCKCHAIN_IN",
      "BLOCKCHAIN_OUT",
      "RAIL_IN",
      "RAIL_OUT",
      "BOOK_TRANSFER",
      "INTEREST",
      "FEE",
      "ADJUSTMENT",
    ]),
  ).pipe(T.HttpQuery("transaction_type")),
  status: Schema.optional(
    Schema.Literals(["CREATED", "PENDING", "SETTLED", "FAILED", "REVERSED"]),
  ).pipe(T.HttpQuery("status")),
  associated_payment_id: Schema.optional(Schema.String).pipe(
    T.HttpQuery("associated_payment_id"),
  ),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
}).pipe(
  T.Http({ method: "GET", path: "/transactions" }),
) as unknown as GeneratedStructCodec<ListTransactionsInput>;

// Output Schema
export interface ListTransactionsOutput {
  data: ReadonlyArray<{
    id: string;
    type: "TRANSACTION";
    url: string;
    created_at: string;
    updated_at: string;
    archived_at?: string | null;
    status: "CREATED" | "PENDING" | "SETTLED" | "FAILED" | "REVERSED";
    transaction_type:
      | "ACH_IN"
      | "ACH_OUT"
      | "WIRE_IN"
      | "WIRE_OUT"
      | "INTERNATIONAL_WIRE_IN"
      | "INTERNATIONAL_WIRE_OUT"
      | "BLOCKCHAIN_IN"
      | "BLOCKCHAIN_OUT"
      | "RAIL_IN"
      | "RAIL_OUT"
      | "BOOK_TRANSFER"
      | "INTEREST"
      | "FEE"
      | "ADJUSTMENT";
    amount: {
      currency: string;
      exponent?: number;
      value: string;
      display_value?: string;
    };
    description: string | null;
    associated_payments?: ReadonlyArray<{
      type: string;
      id: string;
      url: string;
    }> | null;
    from?: {
      type: string;
      id: string;
      url?: string;
      description?: string | null;
    } | null;
    to?: {
      type: string;
      id: string;
      url: string;
      description?: string | null;
    } | null;
  }>;
  has_more: boolean;
  page_size: number;
  page_next?: string | null;
  page_prev?: string | null;
  url: string;
}
export const ListTransactionsOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
  {
    data: Schema.Array(
      Schema.Struct({
        id: Schema.String,
        type: Schema.Literals(["TRANSACTION"]),
        url: Schema.String,
        created_at: Schema.String,
        updated_at: Schema.String,
        archived_at: Schema.optional(Schema.NullOr(Schema.String)),
        status: Schema.Literals([
          "CREATED",
          "PENDING",
          "SETTLED",
          "FAILED",
          "REVERSED",
        ]),
        transaction_type: Schema.Literals([
          "ACH_IN",
          "ACH_OUT",
          "WIRE_IN",
          "WIRE_OUT",
          "INTERNATIONAL_WIRE_IN",
          "INTERNATIONAL_WIRE_OUT",
          "BLOCKCHAIN_IN",
          "BLOCKCHAIN_OUT",
          "RAIL_IN",
          "RAIL_OUT",
          "BOOK_TRANSFER",
          "INTEREST",
          "FEE",
          "ADJUSTMENT",
        ]),
        amount: Schema.Struct({
          currency: Schema.String,
          exponent: Schema.optional(Schema.Number),
          value: Schema.String,
          display_value: Schema.optional(Schema.String),
        }),
        description: Schema.NullOr(Schema.String),
        associated_payments: Schema.optional(
          Schema.NullOr(
            Schema.Array(
              Schema.Struct({
                type: Schema.String,
                id: Schema.String,
                url: Schema.String,
              }),
            ),
          ),
        ),
        from: Schema.optional(
          Schema.NullOr(
            Schema.Struct({
              type: Schema.String,
              id: Schema.String,
              url: Schema.optional(Schema.String),
              description: Schema.optional(Schema.NullOr(Schema.String)),
            }),
          ),
        ),
        to: Schema.optional(
          Schema.NullOr(
            Schema.Struct({
              type: Schema.String,
              id: Schema.String,
              url: Schema.String,
              description: Schema.optional(Schema.NullOr(Schema.String)),
            }),
          ),
        ),
      }),
    ),
    has_more: Schema.Boolean,
    page_size: Schema.Number,
    page_next: Schema.optional(Schema.NullOr(Schema.String)),
    page_prev: Schema.optional(Schema.NullOr(Schema.String)),
    url: Schema.String,
  },
) as unknown as GeneratedStructCodec<ListTransactionsOutput>;

// The operation
/**
 * List Transactions
 *
 * Transactions represent the complete history of balance changes across all accounts. Unlike Payments, which are instructions to move money, transactions are records that represent balance movements in the bank's ledger. This endpoint retrieves a paginated list of all Transactions.
 *
 * @param page_size - Number of items per page (max 100)
 * @param starting_after - Cursor for pagination (exclusive start)
 * @param ending_before - Cursor for pagination (exclusive end)
 * @param account_id - Filter by account ID (matches both source and destination). Mutually exclusive with from_id and to_id.
 * @param from_id - Filter by source account or resource ID
 * @param to_id - Filter by destination account or resource ID
 * @param transaction_type - Filter by transaction type
 * @param status - Filter by transaction status
 * @param associated_payment_id - Filter by associated payment resource ID
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const listTransactions = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListTransactionsInput,
  outputSchema: ListTransactionsOutput,
}));
