import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound, Conflict } from "../errors.ts";

// Input Schema
export interface CreateBookTransferInput {
  ereborVersion?: string;
  ereborIdempotencyKey?: string;
  from_deposit_account_id: string;
  to_deposit_account_id: string;
  amount: { currency: "USD"; value: string };
  memo?: string | null;
  custom_ref?: string;
  custom_fields?: Record<string, unknown>;
}
export const CreateBookTransferInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
    ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Idempotency-Key"),
    ),
    from_deposit_account_id: Schema.String,
    to_deposit_account_id: Schema.String,
    amount: Schema.Struct({
      currency: Schema.Literals(["USD"]),
      value: Schema.String,
    }),
    memo: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(
    T.Http({ method: "POST", path: "/book_transfers" }),
  ) as unknown as Schema.Codec<CreateBookTransferInput>;

// Output Schema
export interface CreateBookTransferOutput {
  id: string;
  type: "BOOK_TRANSFER";
  url: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  program_id?: string | null;
  status: "PENDING" | "FAILED" | "SETTLED" | "CREATED";
  from_deposit_account_id: string;
  to_deposit_account_id: string;
  amount: {
    currency: "USD";
    exponent: number;
    value: string;
    display_value: string;
  };
  memo?: string | null;
  custom_ref?: string | null;
  custom_fields?: Record<string, unknown> | null;
}
export const CreateBookTransferOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["BOOK_TRANSFER"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    program_id: Schema.optional(Schema.NullOr(Schema.String)),
    status: Schema.Literals(["PENDING", "FAILED", "SETTLED", "CREATED"]),
    from_deposit_account_id: Schema.String,
    to_deposit_account_id: Schema.String,
    amount: Schema.Struct({
      currency: Schema.Literals(["USD"]),
      exponent: Schema.Number,
      value: Schema.String,
      display_value: Schema.String,
    }),
    memo: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
    custom_fields: Schema.optional(
      Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
    ),
  }) as unknown as Schema.Codec<CreateBookTransferOutput>;

// The operation
/**
 * Create Book Transfer
 *
 * Create a new Book Transfer between two accounts
 *
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const createBookTransfer = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateBookTransferInput,
  outputSchema: CreateBookTransferOutput,
  errors: [BadRequest, NotFound, Conflict] as const,
}));
