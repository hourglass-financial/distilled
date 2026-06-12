import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const GetCustomerInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String.pipe(T.PathParam()),
}).pipe(T.Http({ method: "GET", path: "/customers/{id}" }));
export type GetCustomerInput = typeof GetCustomerInput.Type;

// Output Schema
export const GetCustomerOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
export type GetCustomerOutput = typeof GetCustomerOutput.Type;

// The operation
/**
 * Retrieve Customer
 *
 * Retrieve a specific Customer by ID
 *
 * @param id - Customer ID
 */
export const getCustomer = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetCustomerInput,
  outputSchema: GetCustomerOutput,
  errors: [BadRequest, NotFound] as const,
}));
