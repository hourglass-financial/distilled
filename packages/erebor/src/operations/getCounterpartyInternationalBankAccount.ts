import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const GetCounterpartyInternationalBankAccountInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({
      method: "GET",
      path: "/counterparty_international_bank_accounts/{id}",
    }),
  );
export type GetCounterpartyInternationalBankAccountInput =
  typeof GetCounterpartyInternationalBankAccountInput.Type;

// Output Schema
export const GetCounterpartyInternationalBankAccountOutput =
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
export type GetCounterpartyInternationalBankAccountOutput =
  typeof GetCounterpartyInternationalBankAccountOutput.Type;

// The operation
/**
 * Retrieve Counterparty International Bank Account
 *
 * Retrieve a specific Counterparty International Bank Account by ID
 *
 * @param id - International bank account ID
 * @param Erebor-Version - Optional API version header. Use a date-based Erebor API version when you need to pin request behavior.
 */
export const getCounterpartyInternationalBankAccount =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: GetCounterpartyInternationalBankAccountInput,
    outputSchema: GetCounterpartyInternationalBankAccountOutput,
    errors: [BadRequest, NotFound] as const,
  }));
