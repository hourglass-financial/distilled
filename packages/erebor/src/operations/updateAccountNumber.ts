import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const UpdateAccountNumberInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    name: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(T.Http({ method: "PATCH", path: "/account_numbers/{id}" }));
export type UpdateAccountNumberInput = typeof UpdateAccountNumberInput.Type;

// Output Schema
export const UpdateAccountNumberOutput =
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
export type UpdateAccountNumberOutput = typeof UpdateAccountNumberOutput.Type;

// The operation
/**
 * Update Account Number
 *
 * Update an account number's `name`, `custom_ref`, or `custom_fields`. The account number, routing number, and default flag are immutable.
 *
 * @param id - Account number ID
 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const updateAccountNumber = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateAccountNumberInput,
  outputSchema: UpdateAccountNumberOutput,
  errors: [BadRequest, NotFound] as const,
}));
