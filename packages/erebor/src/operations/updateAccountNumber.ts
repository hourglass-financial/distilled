import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound, Conflict } from "../errors.ts";

// Input Schema
export interface UpdateAccountNumberInput {
  id: string;
  ereborVersion?: string;
  ereborIdempotencyKey?: string;
  name?: string | null;
  custom_ref?: string;
  custom_fields?: Record<string, unknown>;
}
export const UpdateAccountNumberInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
    ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Idempotency-Key"),
    ),
    name: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(
    T.Http({ method: "PATCH", path: "/account_numbers/{id}" }),
  ) as unknown as Schema.Codec<UpdateAccountNumberInput>;

// Output Schema
export interface UpdateAccountNumberOutput {
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
    custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
    custom_fields: Schema.optional(
      Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
    ),
  }) as unknown as Schema.Codec<UpdateAccountNumberOutput>;

// The operation
/**
 * Update Account Number
 *
 * Update an account number's `name`, `custom_ref`, or `custom_fields`. The account number, routing number, and default flag are immutable.
 *
 * @param id - Account number ID
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const updateAccountNumber = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateAccountNumberInput,
  outputSchema: UpdateAccountNumberOutput,
  errors: [BadRequest, NotFound, Conflict] as const,
}));
