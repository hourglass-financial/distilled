import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface GetTransactionInput {
  id: string;
  ereborVersion?: string;
}
export const GetTransactionInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String.pipe(T.PathParam()),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
}).pipe(
  T.Http({ method: "GET", path: "/transactions/{id}" }),
) as unknown as GeneratedStructCodec<GetTransactionInput>;

// Output Schema
export interface GetTransactionOutput {
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
}
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
}) as unknown as GeneratedStructCodec<GetTransactionOutput>;

// The operation
/**
 * Retrieve Transaction
 *
 * Transactions represent the complete history of balance changes across all accounts. Unlike Payments, which are instructions to move money, transactions are records that represent balance movements in the bank's ledger. This endpoint retrieves a specific Transaction by its ID.
 *
 * @param id - Transaction ID
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getTransaction = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetTransactionInput,
  outputSchema: GetTransactionOutput,
  errors: [BadRequest, NotFound] as const,
}));
