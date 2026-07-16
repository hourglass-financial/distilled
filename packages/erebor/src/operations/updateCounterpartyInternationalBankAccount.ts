import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound, Conflict } from "../errors.ts";

// Input Schema
export interface UpdateCounterpartyInternationalBankAccountInput {
  id: string;
  ereborVersion?: string;
  ereborIdempotencyKey?: string;
  description?: string;
  custom_ref?: string;
  custom_fields?: Record<string, unknown>;
}
export const UpdateCounterpartyInternationalBankAccountInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
    ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Idempotency-Key"),
    ),
    description: Schema.optional(Schema.String),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(
    T.Http({
      method: "PATCH",
      path: "/counterparty_international_bank_accounts/{id}",
    }),
  ) as unknown as Schema.Codec<UpdateCounterpartyInternationalBankAccountInput>;

// Output Schema
export interface UpdateCounterpartyInternationalBankAccountOutput {
  id: string;
  type: "COUNTERPARTY_INTERNATIONAL_BANK_ACCOUNT";
  url: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  customer_id?: string | null;
  program_id?: string | null;
  counterparty_id?: string | null;
  description: string | null;
  account_number: string;
  bic: string;
  country_code: string;
  additional_account_number_data?: {
    canada?: {
      institution_number: string;
      transit_number: string;
      account_number?: string;
    } | null;
  } | null;
  custom_ref?: string | null;
  custom_fields?: Record<string, unknown> | null;
}
export const UpdateCounterpartyInternationalBankAccountOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["COUNTERPARTY_INTERNATIONAL_BANK_ACCOUNT"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    customer_id: Schema.optional(Schema.NullOr(Schema.String)),
    program_id: Schema.optional(Schema.NullOr(Schema.String)),
    counterparty_id: Schema.optional(Schema.NullOr(Schema.String)),
    description: Schema.NullOr(Schema.String),
    account_number: Schema.String,
    bic: Schema.String,
    country_code: Schema.String,
    additional_account_number_data: Schema.optional(
      Schema.NullOr(
        Schema.Struct({
          canada: Schema.optional(
            Schema.NullOr(
              Schema.Struct({
                institution_number: Schema.String,
                transit_number: Schema.String,
                account_number: Schema.optional(Schema.String),
              }),
            ),
          ),
        }),
      ),
    ),
    custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
    custom_fields: Schema.optional(
      Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
    ),
  }) as unknown as Schema.Codec<UpdateCounterpartyInternationalBankAccountOutput>;

// The operation
/**
 * Update Counterparty International Bank Account
 *
 * Update a counterparty international bank account's `description`, `custom_ref`, or `custom_fields`. The account number and BIC are immutable.
 *
 * @param id - International bank account ID
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const updateCounterpartyInternationalBankAccount =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: UpdateCounterpartyInternationalBankAccountInput,
    outputSchema: UpdateCounterpartyInternationalBankAccountOutput,
    errors: [BadRequest, NotFound, Conflict] as const,
  }));
