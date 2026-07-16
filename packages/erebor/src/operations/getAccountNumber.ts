import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface GetAccountNumberInput {
  id: string;
  ereborVersion?: string;
}
export const GetAccountNumberInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String.pipe(T.PathParam()),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
}).pipe(
  T.Http({ method: "GET", path: "/account_numbers/{id}" }),
) as unknown as Schema.Codec<GetAccountNumberInput>;

// Output Schema
export interface GetAccountNumberOutput {
  id: string;
  type: "ACCOUNT_NUMBER";
  url: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  program_id?: string | null;
  deposit_account_id: string;
  name?: string | null;
  account_number: string;
  routing_number: string;
  default: boolean;
  custom_ref?: string | null;
  custom_fields?: Record<string, unknown> | null;
}
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
    custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
    custom_fields: Schema.optional(
      Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
    ),
  },
) as unknown as Schema.Codec<GetAccountNumberOutput>;

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
