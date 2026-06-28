import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const GetTransactionInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String.pipe(T.PathParam()),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
}).pipe(T.Http({ method: "GET", path: "/transactions/{id}" }));
export type GetTransactionInput = typeof GetTransactionInput.Type;

// Output Schema
export const GetTransactionOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
});
export type GetTransactionOutput = typeof GetTransactionOutput.Type;

// The operation
/**
 * Retrieve Transaction
 *
 * Transactions represent the complete history of balance changes across all accounts. Unlike Payments, which are instructions to move money, transactions are records that represent balance movements in the bank's ledger. This endpoint retrieves a specific Transaction by its ID.
 *
 * @param id - Transaction ID
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getTransaction = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetTransactionInput,
  outputSchema: GetTransactionOutput,
  errors: [BadRequest, NotFound] as const,
}));
