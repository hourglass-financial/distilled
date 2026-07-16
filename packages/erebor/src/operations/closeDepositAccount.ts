import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound, Conflict } from "../errors.ts";

// Input Schema
export interface CloseDepositAccountInput {
  id: string;
  ereborVersion?: string;
  ereborIdempotencyKey?: string;
}
export const CloseDepositAccountInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
    ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Idempotency-Key"),
    ),
  }).pipe(
    T.Http({ method: "POST", path: "/deposit_accounts/{id}/close" }),
  ) as unknown as Schema.Codec<CloseDepositAccountInput>;

// Output Schema
export interface CloseDepositAccountOutput {
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
}
export const CloseDepositAccountOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
  }) as unknown as Schema.Codec<CloseDepositAccountOutput>;

// The operation
/**
 * Close Deposit Account
 *
 * <Callout intent="warn" title="**Coming Soon**">
 * Programmatic account closure is not yet available. This endpoint will return a `429` response.
 * </Callout>
 *
 * @param id - Deposit Account ID
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const closeDepositAccount = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CloseDepositAccountInput,
  outputSchema: CloseDepositAccountOutput,
  errors: [BadRequest, NotFound, Conflict] as const,
}));
