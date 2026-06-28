import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const GetAccountNumberInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String.pipe(T.PathParam()),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
}).pipe(T.Http({ method: "GET", path: "/account_numbers/{id}" }));
export type GetAccountNumberInput = typeof GetAccountNumberInput.Type;

// Output Schema
export const GetAccountNumberOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
  {
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
  },
);
export type GetAccountNumberOutput = typeof GetAccountNumberOutput.Type;

// The operation
/**
 * Retrieve Account Number
 *
 * Retrieve a specific Account Number by ID
 *
 * @param id - Account number ID
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getAccountNumber = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetAccountNumberInput,
  outputSchema: GetAccountNumberOutput,
  errors: [BadRequest, NotFound] as const,
}));
