import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const CreateAccountNumberInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    deposit_account_id: Schema.String,
    name: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(T.Http({ method: "POST", path: "/account_numbers" }));
export type CreateAccountNumberInput = typeof CreateAccountNumberInput.Type;

// Output Schema
export const CreateAccountNumberOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
  });
export type CreateAccountNumberOutput = typeof CreateAccountNumberOutput.Type;

// The operation
/**
 * Create Account Number
 *
 * Create a new Account Number for a Deposit Account
 *
 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const createAccountNumber = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateAccountNumberInput,
  outputSchema: CreateAccountNumberOutput,
  errors: [BadRequest, NotFound] as const,
}));
