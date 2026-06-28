import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";

// Input Schema
export const ListTransactionsInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  page_size: Schema.optional(Schema.Number),
  starting_after: Schema.optional(Schema.String),
  ending_before: Schema.optional(Schema.String),
  account_id: Schema.optional(Schema.String),
  from_id: Schema.optional(Schema.String),
  to_id: Schema.optional(Schema.String),
  transaction_type: Schema.optional(Schema.String),
  status: Schema.optional(Schema.String),
  associated_payment_id: Schema.optional(Schema.String),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
}).pipe(T.Http({ method: "GET", path: "/transactions" }));
export type ListTransactionsInput = typeof ListTransactionsInput.Type;

// Output Schema
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
        from: Schema.optional(Schema.Unknown),
        to: Schema.optional(Schema.Unknown),
      }),
    ),
    has_more: Schema.Boolean,
    page_size: Schema.Number,
    page_next: Schema.optional(Schema.NullOr(Schema.String)),
    page_prev: Schema.optional(Schema.NullOr(Schema.String)),
    url: Schema.String,
  },
);
export type ListTransactionsOutput = typeof ListTransactionsOutput.Type;

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
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const listTransactions = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListTransactionsInput,
  outputSchema: ListTransactionsOutput,
}));
