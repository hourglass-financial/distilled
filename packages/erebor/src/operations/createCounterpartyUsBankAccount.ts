import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound, UnprocessableEntity } from "../errors.ts";

// Input Schema
export const CreateCounterpartyUsBankAccountInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Idempotency-Key"),
    ),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
    counterparty_id: Schema.String,
    description: Schema.String,
    account_number: Schema.String,
    routing_number: Schema.String,
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(T.Http({ method: "POST", path: "/counterparty_us_bank_accounts" }));
export type CreateCounterpartyUsBankAccountInput =
  typeof CreateCounterpartyUsBankAccountInput.Type;

// Output Schema
export const CreateCounterpartyUsBankAccountOutput =
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
export type CreateCounterpartyUsBankAccountOutput =
  typeof CreateCounterpartyUsBankAccountOutput.Type;

// The operation
/**
 * Create Counterparty US Bank Account
 *
 * Create a new US Bank Account for a Counterparty
 *
 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 * @param Erebor-Version - Optional API version header. Use a date-based Erebor API version when you need to pin request behavior.
 */
export const createCounterpartyUsBankAccount =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: CreateCounterpartyUsBankAccountInput,
    outputSchema: CreateCounterpartyUsBankAccountOutput,
    errors: [BadRequest, NotFound, UnprocessableEntity] as const,
  }));
