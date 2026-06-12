import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";

// Input Schema
export const ListBookTransfersInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
  {
    page_size: Schema.optional(Schema.Number),
    starting_after: Schema.optional(Schema.String),
    ending_before: Schema.optional(Schema.String),
    from_deposit_account_id: Schema.optional(Schema.String),
    to_deposit_account_id: Schema.optional(Schema.String),
    status: Schema.optional(Schema.String),
    custom_ref: Schema.optional(Schema.String),
  },
).pipe(T.Http({ method: "GET", path: "/book_transfers" }));
export type ListBookTransfersInput = typeof ListBookTransfersInput.Type;

// Output Schema
export const ListBookTransfersOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
        id: Schema.String,
        type: Schema.Literals(["BOOK_TRANSFER"]),
        url: Schema.String,
        created_at: Schema.String,
        updated_at: Schema.String,
        archived_at: Schema.optional(Schema.NullOr(Schema.String)),
        program_id: Schema.optional(Schema.NullOr(Schema.String)),
        status: Schema.Literals(["PENDING", "FAILED", "SETTLED"]),
        from_deposit_account_id: Schema.String,
        to_deposit_account_id: Schema.String,
        amount: Schema.Struct({
          currency: Schema.Literals(["USD"]),
          exponent: Schema.Number,
          value: Schema.String,
          display_value: Schema.String,
        }),
        memo: Schema.optional(Schema.NullOr(Schema.String)),
        custom_ref: Schema.optional(Schema.Unknown),
        custom_fields: Schema.optional(Schema.Unknown),
      }),
    ),
    has_more: Schema.Boolean,
    page_size: Schema.Number,
    page_next: Schema.optional(Schema.NullOr(Schema.String)),
    page_prev: Schema.optional(Schema.NullOr(Schema.String)),
    url: Schema.String,
  });
export type ListBookTransfersOutput = typeof ListBookTransfersOutput.Type;

// The operation
/**
 * List Book Transfers
 *
 * Retrieve a paginated list of Book Transfers
 *
 * @param page_size - Number of items per page (max 100)
 * @param starting_after - Cursor for pagination (exclusive start)
 * @param ending_before - Cursor for pagination (exclusive end)
 * @param from_deposit_account_id - Filter by source account ID
 * @param to_deposit_account_id - Filter by destination account ID
 * @param status - Filter by transfer status
 * @param custom_ref - Filter by exact `custom_ref` match (case-sensitive, up to 255 characters).
 */
export const listBookTransfers = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListBookTransfersInput,
  outputSchema: ListBookTransfersOutput,
}));
