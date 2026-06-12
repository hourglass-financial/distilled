import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";

// Input Schema
export const ListCounterpartyInternationalBankAccountsInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    page_size: Schema.optional(Schema.Number),
    starting_after: Schema.optional(Schema.String),
    ending_before: Schema.optional(Schema.String),
    counterparty_id: Schema.optional(Schema.String),
    customer_id: Schema.optional(Schema.String),
    program_id: Schema.optional(Schema.String),
    custom_ref: Schema.optional(Schema.String),
  }).pipe(
    T.Http({
      method: "GET",
      path: "/counterparty_international_bank_accounts",
    }),
  );
export type ListCounterpartyInternationalBankAccountsInput =
  typeof ListCounterpartyInternationalBankAccountsInput.Type;

// Output Schema
export const ListCounterpartyInternationalBankAccountsOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
        id: Schema.String,
        type: Schema.Literals(["COUNTERPARTY_INTERNATIONAL_BANK_ACCOUNT"]),
        url: Schema.String,
        created_at: Schema.String,
        updated_at: Schema.String,
        archived_at: Schema.optional(Schema.NullOr(Schema.String)),
        customer_id: Schema.optional(Schema.NullOr(Schema.String)),
        program_id: Schema.optional(Schema.NullOr(Schema.String)),
        counterparty_id: Schema.optional(Schema.NullOr(Schema.String)),
        description: Schema.String,
        account_number: Schema.String,
        bic: Schema.String,
        country_code: Schema.String,
        additional_account_number_data: Schema.optional(Schema.Unknown),
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
export type ListCounterpartyInternationalBankAccountsOutput =
  typeof ListCounterpartyInternationalBankAccountsOutput.Type;

// The operation
/**
 * List Counterparty International Bank Accounts
 *
 * Retrieve a paginated list of Counterparty International Bank Accounts
 *
 * @param page_size - Number of items per page (max 100)
 * @param starting_after - Cursor for pagination (exclusive start)
 * @param ending_before - Cursor for pagination (exclusive end)
 * @param counterparty_id - Filter by Counterparty ID
 * @param customer_id - Filter by customer ID
 * @param program_id - Filter by program ID
 * @param custom_ref - Filter by exact `custom_ref` match (case-sensitive, up to 255 characters).
 */
export const listCounterpartyInternationalBankAccounts =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: ListCounterpartyInternationalBankAccountsInput,
    outputSchema: ListCounterpartyInternationalBankAccountsOutput,
  }));
