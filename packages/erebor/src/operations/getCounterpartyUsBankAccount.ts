import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface GetCounterpartyUsBankAccountInput {
  id: string;
  ereborVersion?: string;
}
export const GetCounterpartyUsBankAccountInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/counterparty_us_bank_accounts/{id}" }),
  ) as unknown as GeneratedStructCodec<GetCounterpartyUsBankAccountInput>;

// Output Schema
export interface GetCounterpartyUsBankAccountOutput {
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
export const GetCounterpartyUsBankAccountOutput =
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
  }) as unknown as GeneratedStructCodec<GetCounterpartyUsBankAccountOutput>;

// The operation
/**
 * Retrieve Counterparty US Bank Account
 *
 * Retrieve a specific Counterparty US Bank Account by ID
 *
 * @param id - US Bank Account ID
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getCounterpartyUsBankAccount =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: GetCounterpartyUsBankAccountInput,
    outputSchema: GetCounterpartyUsBankAccountOutput,
    errors: [BadRequest, NotFound] as const,
  }));
