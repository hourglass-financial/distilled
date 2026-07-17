import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import {
  BadRequest,
  Conflict,
  UnprocessableEntity,
  EreborValidationError,
} from "../errors.ts";

// Input Schema
export interface CreateAccountNumberInput {
  ereborVersion?: string;
  ereborIdempotencyKey?: string;
  deposit_account_id: string;
  name?: string | null;
  custom_ref?: string;
  custom_fields?: Record<string, unknown>;
}
export const CreateAccountNumberInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
    ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Idempotency-Key"),
    ),
    deposit_account_id: Schema.String,
    name: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(
    T.Http({ method: "POST", path: "/account_numbers" }),
  ) as unknown as GeneratedStructCodec<CreateAccountNumberInput>;

// Output Schema
export interface CreateAccountNumberOutput {
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
    custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
    custom_fields: Schema.optional(
      Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
    ),
  }) as unknown as GeneratedStructCodec<CreateAccountNumberOutput>;

// The operation
/**
 * Create Account Number
 *
 * Create a new Account Number for a Deposit Account
 *
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param ereborIdempotencyKey - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const createAccountNumber = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateAccountNumberInput,
  outputSchema: CreateAccountNumberOutput,
  errors: [
    BadRequest,
    Conflict,
    UnprocessableEntity,
    EreborValidationError,
  ] as const,
}));
