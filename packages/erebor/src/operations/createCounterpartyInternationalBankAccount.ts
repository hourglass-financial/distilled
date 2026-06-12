import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound, UnprocessableEntity } from "../errors.ts";

// Input Schema
export const CreateCounterpartyInternationalBankAccountInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    counterparty_id: Schema.String,
    description: Schema.String,
    account_number: Schema.String,
    bic: Schema.String,
    additional_account_number_data: Schema.optional(Schema.Unknown),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(
    T.Http({
      method: "POST",
      path: "/counterparty_international_bank_accounts",
    }),
  );
export type CreateCounterpartyInternationalBankAccountInput =
  typeof CreateCounterpartyInternationalBankAccountInput.Type;

// Output Schema
export const CreateCounterpartyInternationalBankAccountOutput =
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
export type CreateCounterpartyInternationalBankAccountOutput =
  typeof CreateCounterpartyInternationalBankAccountOutput.Type;

// The operation
/**
 * Create Counterparty International Bank Account
 *
 * Create a new international bank account for a Counterparty
 *
 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const createCounterpartyInternationalBankAccount =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: CreateCounterpartyInternationalBankAccountInput,
    outputSchema: CreateCounterpartyInternationalBankAccountOutput,
    errors: [BadRequest, NotFound, UnprocessableEntity] as const,
  }));
