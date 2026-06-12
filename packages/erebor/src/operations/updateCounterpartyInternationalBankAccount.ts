import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const UpdateCounterpartyInternationalBankAccountInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
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
  );
export type UpdateCounterpartyInternationalBankAccountInput =
  typeof UpdateCounterpartyInternationalBankAccountInput.Type;

// Output Schema
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
    description: Schema.String,
    account_number: Schema.String,
    bic: Schema.String,
    country_code: Schema.String,
    additional_account_number_data: Schema.optional(Schema.Unknown),
    custom_ref: Schema.optional(Schema.Unknown),
    custom_fields: Schema.optional(Schema.Unknown),
  });
export type UpdateCounterpartyInternationalBankAccountOutput =
  typeof UpdateCounterpartyInternationalBankAccountOutput.Type;

// The operation
/**
 * Update Counterparty International Bank Account
 *
 * Update a counterparty international bank account's `description`, `custom_ref`, or `custom_fields`. The account number and BIC are immutable.
 *
 * @param id - International bank account ID
 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const updateCounterpartyInternationalBankAccount =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: UpdateCounterpartyInternationalBankAccountInput,
    outputSchema: UpdateCounterpartyInternationalBankAccountOutput,
    errors: [BadRequest, NotFound] as const,
  }));
