import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const GetCounterpartyUsBankAccountInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
  }).pipe(
    T.Http({ method: "GET", path: "/counterparty_us_bank_accounts/{id}" }),
  );
export type GetCounterpartyUsBankAccountInput =
  typeof GetCounterpartyUsBankAccountInput.Type;

// Output Schema
export const GetCounterpartyUsBankAccountOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["COUNTERPARTY_US_BANK_ACCOUNT"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    customer_id: Schema.optional(Schema.NullOr(Schema.String)),
    program_id: Schema.optional(Schema.NullOr(Schema.String)),
    counterparty_id: Schema.optional(Schema.NullOr(Schema.String)),
    description: Schema.String,
    account_number: Schema.String,
    routing_number: Schema.String,
    bank_name: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.Unknown),
    custom_fields: Schema.optional(Schema.Unknown),
  });
export type GetCounterpartyUsBankAccountOutput =
  typeof GetCounterpartyUsBankAccountOutput.Type;

// The operation
/**
 * Retrieve Counterparty US Bank Account
 *
 * Retrieve a specific Counterparty US Bank Account by ID
 *
 * @param id - US Bank Account ID
 */
export const getCounterpartyUsBankAccount =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: GetCounterpartyUsBankAccountInput,
    outputSchema: GetCounterpartyUsBankAccountOutput,
    errors: [BadRequest, NotFound] as const,
  }));
