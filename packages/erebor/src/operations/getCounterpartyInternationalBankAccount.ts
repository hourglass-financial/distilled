import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface GetCounterpartyInternationalBankAccountInput {
  id: string;
  ereborVersion?: string;
}
export const GetCounterpartyInternationalBankAccountInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({
      method: "GET",
      path: "/counterparty_international_bank_accounts/{id}",
    }),
  ) as unknown as GeneratedStructCodec<GetCounterpartyInternationalBankAccountInput>;

// Output Schema
export interface GetCounterpartyInternationalBankAccountOutput {
  id: string;
  type: "COUNTERPARTY_INTERNATIONAL_BANK_ACCOUNT";
  url: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  customer_id?: string | null;
  program_id?: string | null;
  counterparty_id?: string | null;
  description: string | null;
  account_number: string;
  bic: string;
  country_code: string;
  additional_account_number_data?: {
    canada?: {
      institution_number: string;
      transit_number: string;
      account_number?: string;
    } | null;
  } | null;
  custom_ref?: string | null;
  custom_fields?: Record<string, unknown> | null;
}
export const GetCounterpartyInternationalBankAccountOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["COUNTERPARTY_INTERNATIONAL_BANK_ACCOUNT"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    customer_id: Schema.optional(Schema.NullOr(Schema.String)),
    program_id: Schema.optional(Schema.NullOr(Schema.String)),
    counterparty_id: Schema.optional(Schema.NullOr(Schema.String)),
    description: Schema.NullOr(Schema.String),
    account_number: Schema.String,
    bic: Schema.String,
    country_code: Schema.String,
    additional_account_number_data: Schema.optional(
      Schema.NullOr(
        Schema.Struct({
          canada: Schema.optional(
            Schema.NullOr(
              Schema.Struct({
                institution_number: Schema.String,
                transit_number: Schema.String,
                account_number: Schema.optional(Schema.String),
              }),
            ),
          ),
        }),
      ),
    ),
    custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
    custom_fields: Schema.optional(
      Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
    ),
  }) as unknown as GeneratedStructCodec<GetCounterpartyInternationalBankAccountOutput>;

// The operation
/**
 * Retrieve Counterparty International Bank Account
 *
 * Retrieve a specific Counterparty International Bank Account by ID
 *
 * @param id - International bank account ID
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getCounterpartyInternationalBankAccount =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: GetCounterpartyInternationalBankAccountInput,
    outputSchema: GetCounterpartyInternationalBankAccountOutput,
    errors: [BadRequest, NotFound] as const,
  }));
