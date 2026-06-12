import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";

// Input Schema
export const ListDepositAccountsInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    page_size: Schema.optional(Schema.Number),
    starting_after: Schema.optional(Schema.String),
    ending_before: Schema.optional(Schema.String),
    status: Schema.optional(Schema.String),
    deposit_account_type: Schema.optional(Schema.String),
    customer_id: Schema.optional(Schema.String),
    program_id: Schema.optional(Schema.String),
    parent_account_id: Schema.optional(Schema.String),
    custom_ref: Schema.optional(Schema.String),
  }).pipe(T.Http({ method: "GET", path: "/deposit_accounts" }));
export type ListDepositAccountsInput = typeof ListDepositAccountsInput.Type;

// Output Schema
export const ListDepositAccountsOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
        id: Schema.String,
        type: Schema.Literals(["DEPOSIT_ACCOUNT"]),
        url: Schema.String,
        created_at: Schema.String,
        updated_at: Schema.String,
        archived_at: Schema.optional(Schema.NullOr(Schema.String)),
        program_id: Schema.optional(Schema.NullOr(Schema.String)),
        customer_id: Schema.String,
        name: Schema.optional(Schema.NullOr(Schema.String)),
        status: Schema.optional(
          Schema.Literals(["PENDING", "OPEN", "CLOSED", "FROZEN"]),
        ),
        deposit_account_template_id: Schema.String,
        deposit_account_type: Schema.Literals([
          "DDA",
          "FBO",
          "OMNIBUS",
          "VIRTUAL_DDA",
        ]),
        ownership_type: Schema.Literals(["BUSINESS", "INDIVIDUAL"]),
        balances: Schema.Struct({
          current: Schema.Struct({
            currency: Schema.Literals(["USD", "USDC"]),
            exponent: Schema.Number,
            value: Schema.String,
            display_value: Schema.String,
          }),
          available: Schema.Struct({
            currency: Schema.Literals(["USD", "USDC"]),
            exponent: Schema.Number,
            value: Schema.String,
            display_value: Schema.String,
          }),
          pending_in: Schema.Struct({
            currency: Schema.Literals(["USD", "USDC"]),
            exponent: Schema.Number,
            value: Schema.String,
            display_value: Schema.String,
          }),
          pending_out: Schema.Struct({
            currency: Schema.Literals(["USD", "USDC"]),
            exponent: Schema.Number,
            value: Schema.String,
            display_value: Schema.String,
          }),
        }),
        account_numbers: Schema.optional(
          Schema.Array(
            Schema.Struct({
              id: Schema.String,
              type: Schema.Literals(["ACCOUNT_NUMBER"]),
              url: Schema.String,
              created_at: Schema.String,
              updated_at: Schema.String,
              archived_at: Schema.optional(Schema.NullOr(Schema.String)),
              program_id: Schema.optional(Schema.NullOr(Schema.String)),
              deposit_account_id: Schema.String,
              name: Schema.optional(Schema.NullOr(Schema.String)),
              account_number: Schema.String,
              routing_number: Schema.String,
              default: Schema.Boolean,
              custom_ref: Schema.optional(Schema.Unknown),
              custom_fields: Schema.optional(Schema.Unknown),
            }),
          ),
        ),
        default_account_number: Schema.optional(Schema.Unknown),
        blockchain_addresses: Schema.optional(
          Schema.Array(
            Schema.Struct({
              id: Schema.String,
              type: Schema.Literals(["BLOCKCHAIN_ADDRESS"]),
              url: Schema.String,
              created_at: Schema.String,
              updated_at: Schema.String,
              archived_at: Schema.optional(Schema.NullOr(Schema.String)),
              deposit_account_id: Schema.String,
              name: Schema.optional(Schema.NullOr(Schema.String)),
              address: Schema.String,
              address_type: Schema.Literals(["ETHEREUM", "SOLANA", "SUI"]),
              network: Schema.Array(
                Schema.Literals(["BASE", "ETHEREUM", "INK", "SOLANA", "SUI"]),
              ),
              custom_ref: Schema.optional(Schema.Unknown),
              custom_fields: Schema.optional(Schema.Unknown),
            }),
          ),
        ),
        parent_account_id: Schema.optional(Schema.NullOr(Schema.String)),
        disclosures: Schema.Struct({
          disclosures_signed_externally: Schema.Boolean,
        }),
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
export type ListDepositAccountsOutput = typeof ListDepositAccountsOutput.Type;

// The operation
/**
 * List Deposit Accounts
 *
 * Retrieve a paginated list of Deposit Accounts
 *
 * @param page_size - Number of items per page (max 100)
 * @param starting_after - Cursor for pagination (exclusive start)
 * @param ending_before - Cursor for pagination (exclusive end)
 * @param customer_id - Filter by customer ID
 * @param program_id - Filter by program ID
 * @param parent_account_id - Filter by parent account ID (for virtual DDA accounts)
 * @param custom_ref - Filter by exact `custom_ref` match (case-sensitive, up to 255 characters).
 */
export const listDepositAccounts = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListDepositAccountsInput,
  outputSchema: ListDepositAccountsOutput,
}));
