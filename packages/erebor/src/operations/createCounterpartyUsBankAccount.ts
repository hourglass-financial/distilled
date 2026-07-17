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
export interface CreateCounterpartyUsBankAccountInput {
  ereborVersion?: string;
  ereborIdempotencyKey?: string;
  counterparty_id: string;
  description: string;
  account_number: string;
  routing_number: string;
  custom_ref?: string;
  custom_fields?: Record<string, unknown>;
}
export const CreateCounterpartyUsBankAccountInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
    ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Idempotency-Key"),
    ),
    counterparty_id: Schema.String,
    description: Schema.String,
    account_number: Schema.String,
    routing_number: Schema.String,
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(
    T.Http({ method: "POST", path: "/counterparty_us_bank_accounts" }),
  ) as unknown as GeneratedStructCodec<CreateCounterpartyUsBankAccountInput>;

// Output Schema
export interface CreateCounterpartyUsBankAccountOutput {
  id: string;
  type: "COUNTERPARTY_US_BANK_ACCOUNT";
  url: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  customer_id?: string | null;
  program_id?: string | null;
  counterparty_id?: string | null;
  description: string | null;
  account_number: string;
  routing_number: string;
  bank_name?: string | null;
  custom_ref?: string | null;
  custom_fields?: Record<string, unknown> | null;
}
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
    description: Schema.NullOr(Schema.String),
    account_number: Schema.String,
    routing_number: Schema.String,
    bank_name: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
    custom_fields: Schema.optional(
      Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
    ),
  }) as unknown as GeneratedStructCodec<CreateCounterpartyUsBankAccountOutput>;

// The operation
/**
 * Create Counterparty US Bank Account
 *
 * Create a new US Bank Account for a Counterparty
 *
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param ereborIdempotencyKey - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const createCounterpartyUsBankAccount =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: CreateCounterpartyUsBankAccountInput,
    outputSchema: CreateCounterpartyUsBankAccountOutput,
    errors: [
      BadRequest,
      Conflict,
      UnprocessableEntity,
      EreborValidationError,
    ] as const,
  }));
