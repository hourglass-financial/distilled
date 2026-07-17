import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";

// Input Schema
export interface ListDepositAccountsInput {
  page_size?: number;
  starting_after?: string;
  ending_before?: string;
  status?: "PENDING" | "OPEN" | "CLOSED" | "FROZEN";
  deposit_account_type?: "DDA" | "FBO" | "OMNIBUS" | "VIRTUAL_DDA";
  customer_id?: string;
  program_id?: string;
  parent_account_id?: string;
  custom_ref?: string;
  ereborVersion?: string;
}
export const ListDepositAccountsInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    page_size: Schema.optional(Schema.Number).pipe(T.HttpQuery("page_size")),
    starting_after: Schema.optional(Schema.String).pipe(
      T.HttpQuery("starting_after"),
    ),
    ending_before: Schema.optional(Schema.String).pipe(
      T.HttpQuery("ending_before"),
    ),
    status: Schema.optional(
      Schema.Literals(["PENDING", "OPEN", "CLOSED", "FROZEN"]),
    ).pipe(T.HttpQuery("status")),
    deposit_account_type: Schema.optional(
      Schema.Literals(["DDA", "FBO", "OMNIBUS", "VIRTUAL_DDA"]),
    ).pipe(T.HttpQuery("deposit_account_type")),
    customer_id: Schema.optional(Schema.String).pipe(
      T.HttpQuery("customer_id"),
    ),
    program_id: Schema.optional(Schema.String).pipe(T.HttpQuery("program_id")),
    parent_account_id: Schema.optional(Schema.String).pipe(
      T.HttpQuery("parent_account_id"),
    ),
    custom_ref: Schema.optional(Schema.String).pipe(T.HttpQuery("custom_ref")),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/deposit_accounts" }),
  ) as unknown as GeneratedStructCodec<ListDepositAccountsInput>;

// Output Schema
export interface ListDepositAccountsOutput {
  data: ReadonlyArray<{
    id: string;
    type: "DEPOSIT_ACCOUNT";
    url: string;
    created_at: string;
    updated_at: string;
    archived_at?: string | null;
    program_id?: string | null;
    customer_id: string;
    name?: string | null;
    status?: "PENDING" | "OPEN" | "CLOSED" | "FROZEN";
    deposit_account_template_id: string;
    deposit_account_type: "DDA" | "FBO" | "OMNIBUS" | "VIRTUAL_DDA";
    ownership_type: "BUSINESS" | "INDIVIDUAL";
    balances: {
      current: {
        currency: "USD" | "USDC";
        exponent: number;
        value: string;
        display_value: string;
      };
      available: {
        currency: "USD" | "USDC";
        exponent: number;
        value: string;
        display_value: string;
      };
      pending_in: {
        currency: "USD" | "USDC";
        exponent: number;
        value: string;
        display_value: string;
      };
      pending_out: {
        currency: "USD" | "USDC";
        exponent: number;
        value: string;
        display_value: string;
      };
    };
    account_numbers?: ReadonlyArray<{
      id: string;
      type: "ACCOUNT_NUMBER";
      url: string;
      created_at: string;
      updated_at: string;
      archived_at?: string | null;
      program_id?: string | null;
      deposit_account_id: string;
      name?: string | null;
      account_number: string;
      routing_number: string;
      default: boolean;
      custom_ref?: string | null;
      custom_fields?: Record<string, unknown> | null;
    }>;
    default_account_number?: {
      id: string;
      type: "ACCOUNT_NUMBER";
      url: string;
      created_at: string;
      updated_at: string;
      archived_at?: string | null;
      program_id?: string | null;
      deposit_account_id: string;
      name?: string | null;
      account_number: string;
      routing_number: string;
      default: boolean;
      custom_ref?: string | null;
      custom_fields?: Record<string, unknown> | null;
    } | null;
    blockchain_addresses?: ReadonlyArray<{
      id: string;
      type: "BLOCKCHAIN_ADDRESS";
      url: string;
      created_at: string;
      updated_at: string;
      archived_at?: string | null;
      deposit_account_id: string;
      name?: string | null;
      address: string;
      address_type: "ETHEREUM" | "SOLANA" | "SUI";
      network: ReadonlyArray<"BASE" | "ETHEREUM" | "INK" | "SOLANA" | "SUI">;
      custom_ref?: string | null;
      custom_fields?: Record<string, unknown> | null;
    }>;
    parent_account_id?: string | null;
    disclosures: { disclosures_signed_externally: boolean };
    custom_ref?: string | null;
    custom_fields?: Record<string, unknown> | null;
  }>;
  has_more: boolean;
  page_size: number;
  page_next?: string | null;
  page_prev?: string | null;
  url: string;
}
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
              custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
              custom_fields: Schema.optional(
                Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
              ),
            }),
          ),
        ),
        default_account_number: Schema.optional(
          Schema.NullOr(
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
              custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
              custom_fields: Schema.optional(
                Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
              ),
            }),
          ),
        ),
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
              custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
              custom_fields: Schema.optional(
                Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
              ),
            }),
          ),
        ),
        parent_account_id: Schema.optional(Schema.NullOr(Schema.String)),
        disclosures: Schema.Struct({
          disclosures_signed_externally: Schema.Boolean,
        }),
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
  }) as unknown as GeneratedStructCodec<ListDepositAccountsOutput>;

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
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const listDepositAccounts = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListDepositAccountsInput,
  outputSchema: ListDepositAccountsOutput,
}));
