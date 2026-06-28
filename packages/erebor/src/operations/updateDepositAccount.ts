import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound, Conflict } from "../errors.ts";

// Input Schema
export const UpdateDepositAccountInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
    ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Idempotency-Key"),
    ),
    name: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(T.Http({ method: "PATCH", path: "/deposit_accounts/{id}" }));
export type UpdateDepositAccountInput = typeof UpdateDepositAccountInput.Type;

// Output Schema
export const UpdateDepositAccountOutput =
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
  });
export type UpdateDepositAccountOutput = typeof UpdateDepositAccountOutput.Type;

// The operation
/**
 * Update Deposit Account
 *
 * Update a deposit account's `name`, `custom_ref`, or `custom_fields`. Other fields, including status, account numbers, and disclosures, are immutable.
 *
 * @param id - Deposit Account ID
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const updateDepositAccount = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: UpdateDepositAccountInput,
    outputSchema: UpdateDepositAccountOutput,
    errors: [BadRequest, NotFound, Conflict] as const,
  }),
);
