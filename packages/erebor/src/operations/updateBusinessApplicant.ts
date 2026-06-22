import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const UpdateBusinessApplicantInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Idempotency-Key"),
    ),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(T.Http({ method: "PATCH", path: "/business_applicants/{id}" }));
export type UpdateBusinessApplicantInput =
  typeof UpdateBusinessApplicantInput.Type;

// Output Schema
export const UpdateBusinessApplicantOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["BUSINESS_APPLICANT"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    program_id: Schema.String,
    name: Schema.String,
    dba_name: Schema.optional(Schema.NullOr(Schema.String)),
    legal_entity_type: Schema.optional(Schema.Unknown),
    incorporation_address: Schema.Struct({
      street_address: Schema.String,
      city: Schema.String,
      country_area: Schema.optional(Schema.NullOr(Schema.String)),
      postal_code: Schema.String,
      country: Schema.String,
    }),
    incorporation_date: Schema.optional(Schema.NullOr(Schema.String)),
    tin: Schema.optional(Schema.NullOr(Schema.String)),
    description: Schema.optional(Schema.NullOr(Schema.String)),
    industry: Schema.optional(Schema.Unknown),
    industry_financial_services_subtype: Schema.optional(Schema.Unknown),
    industry_crypto_subtype: Schema.optional(Schema.Unknown),
    industry_other_description: Schema.optional(Schema.NullOr(Schema.String)),
    website_url: Schema.optional(Schema.NullOr(Schema.String)),
    phone_number: Schema.optional(Schema.NullOr(Schema.String)),
    physical_address: Schema.Struct({
      street_address: Schema.String,
      city: Schema.String,
      country_area: Schema.optional(Schema.NullOr(Schema.String)),
      postal_code: Schema.String,
      country: Schema.String,
    }),
    expected_counterparty_countries: Schema.optional(
      Schema.NullOr(Schema.Array(Schema.String)),
    ),
    source_of_funds: Schema.optional(
      Schema.NullOr(
        Schema.Array(Schema.Literals(["REVENUE", "INVESTMENT", "OTHER"])),
      ),
    ),
    source_of_funds_other_description: Schema.optional(
      Schema.NullOr(Schema.String),
    ),
    associated_persons: Schema.optional(
      Schema.Array(
        Schema.Struct({
          person_applicant_id: Schema.String,
          title: Schema.String,
          roles: Schema.Array(
            Schema.Literals(["CONTROL_PERSON", "BENEFICIAL_OWNER", "SIGNER"]),
          ),
          ownership_percentage: Schema.Number,
        }),
      ),
    ),
    formation_document_id: Schema.optional(Schema.NullOr(Schema.String)),
    tin_verification_document_id: Schema.optional(Schema.NullOr(Schema.String)),
    authorization_document_id: Schema.optional(Schema.NullOr(Schema.String)),
    is_msb: Schema.optional(Schema.NullOr(Schema.Boolean)),
    account_purposes: Schema.optional(
      Schema.NullOr(
        Schema.Array(
          Schema.Literals([
            "BUSINESS_OPERATIONS",
            "CAPITAL_DEPLOYMENT",
            "CROSS_BORDER_PAYMENTS",
            "STABLECOIN_CONVERSION",
            "OTHER",
          ]),
        ),
      ),
    ),
    account_purposes_other_description: Schema.optional(
      Schema.NullOr(Schema.String),
    ),
    primary_target_market: Schema.optional(Schema.Unknown),
    primary_target_market_other_description: Schema.optional(
      Schema.NullOr(Schema.String),
    ),
    expected_fiat_monthly_volume: Schema.optional(Schema.Unknown),
    expected_crypto_monthly_volume: Schema.optional(Schema.Unknown),
    custom_ref: Schema.optional(Schema.Unknown),
    custom_fields: Schema.optional(Schema.Unknown),
  });
export type UpdateBusinessApplicantOutput =
  typeof UpdateBusinessApplicantOutput.Type;

// The operation
/**
 * Update Business Applicant
 *
 * Update a business applicant's `custom_ref` or `custom_fields`. Identity fields used for KYC are immutable.
 *
 * @param id - Business applicant ID
 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 * @param Erebor-Version - Optional API version header. Use a date-based Erebor API version when you need to pin request behavior.
 */
export const updateBusinessApplicant = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: UpdateBusinessApplicantInput,
    outputSchema: UpdateBusinessApplicantOutput,
    errors: [BadRequest, NotFound] as const,
  }),
);
