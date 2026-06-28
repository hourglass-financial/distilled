import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound, Conflict } from "../errors.ts";

// Input Schema
export const UpdateCustomerInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String.pipe(T.PathParam()),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
  ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Idempotency-Key"),
  ),
  custom_ref: Schema.optional(Schema.String),
  custom_fields: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
}).pipe(T.Http({ method: "PATCH", path: "/customers/{id}" }));
export type UpdateCustomerInput = typeof UpdateCustomerInput.Type;

// Output Schema
export const UpdateCustomerOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String,
  type: Schema.Literals(["CUSTOMER"]),
  url: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  archived_at: Schema.optional(Schema.NullOr(Schema.String)),
  program_id: Schema.optional(Schema.NullOr(Schema.String)),
  status: Schema.Literals(["ACTIVE", "OFFBOARDED"]),
  name: Schema.String,
  onboarding_id: Schema.optional(Schema.NullOr(Schema.String)),
  custom_ref: Schema.optional(Schema.Unknown),
  custom_fields: Schema.optional(Schema.Unknown),
});
export type UpdateCustomerOutput = typeof UpdateCustomerOutput.Type;

// The operation
/**
 * Update Customer
 *
 * Update a customer's `custom_ref` or `custom_fields`. Identity, status, and program assignment are immutable.
 *
 * @param id - Customer ID
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const updateCustomer = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateCustomerInput,
  outputSchema: UpdateCustomerOutput,
  errors: [BadRequest, NotFound, Conflict] as const,
}));
