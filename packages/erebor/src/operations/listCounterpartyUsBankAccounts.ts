import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";

// Input Schema
export interface ListCounterpartyUsBankAccountsInput {
  page_size?: number;
  starting_after?: string;
  ending_before?: string;
  counterparty_id?: string;
  customer_id?: string;
  program_id?: string;
  custom_ref?: string;
  ereborVersion?: string;
}
export const ListCounterpartyUsBankAccountsInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    page_size: Schema.optional(Schema.Number),
    starting_after: Schema.optional(Schema.String),
    ending_before: Schema.optional(Schema.String),
    counterparty_id: Schema.optional(Schema.String),
    customer_id: Schema.optional(Schema.String),
    program_id: Schema.optional(Schema.String),
    custom_ref: Schema.optional(Schema.String),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/counterparty_us_bank_accounts" }),
  ) as unknown as Schema.Codec<ListCounterpartyUsBankAccountsInput>;

// Output Schema
export interface ListCounterpartyUsBankAccountsOutput {
  data: ReadonlyArray<{
    id: string;
    type: "COUNTERPARTY_US_BANK_ACCOUNT";
    url: string;
    created_at: string;
    updated_at: string;
    archived_at?: string | null;
    customer_id?: string | null;
    program_id?: string | null;
    counterparty_id?: string | null;
    description: string | null;
    account_number: string;
    routing_number: string;
    bank_name?: string | null;
    custom_ref?: string | null;
    custom_fields?: Record<string, unknown> | null;
  }>;
  has_more: boolean;
  page_size: number;
  page_next?: string | null;
  page_prev?: string | null;
  url: string;
}
export const ListCounterpartyUsBankAccountsOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
        id: Schema.String,
        type: Schema.Literals(["COUNTERPARTY_US_BANK_ACCOUNT"]),
        url: Schema.String,
        created_at: Schema.String,
        updated_at: Schema.String,
        archived_at: Schema.optional(Schema.NullOr(Schema.String)),
        customer_id: Schema.optional(Schema.NullOr(Schema.String)),
        program_id: Schema.optional(Schema.NullOr(Schema.String)),
        counterparty_id: Schema.optional(Schema.NullOr(Schema.String)),
        description: Schema.NullOr(Schema.String),
        account_number: Schema.String,
        routing_number: Schema.String,
        bank_name: Schema.optional(Schema.NullOr(Schema.String)),
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
  }) as unknown as Schema.Codec<ListCounterpartyUsBankAccountsOutput>;

// The operation
/**
 * List Counterparty US Bank Accounts
 *
 * Retrieve a paginated list of Counterparty US Bank Accounts
 *
 * @param page_size - Number of items per page (max 100)
 * @param starting_after - Cursor for pagination (exclusive start)
 * @param ending_before - Cursor for pagination (exclusive end)
 * @param counterparty_id - Filter by Counterparty ID
 * @param customer_id - Filter by customer ID
 * @param program_id - Filter by program ID
 * @param custom_ref - Filter by exact `custom_ref` match (case-sensitive, up to 255 characters).
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const listCounterpartyUsBankAccounts =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: ListCounterpartyUsBankAccountsInput,
    outputSchema: ListCounterpartyUsBankAccountsOutput,
  }));
