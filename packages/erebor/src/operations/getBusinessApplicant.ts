import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const GetBusinessApplicantInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
  }).pipe(T.Http({ method: "GET", path: "/business_applicants/{id}" }));
export type GetBusinessApplicantInput = typeof GetBusinessApplicantInput.Type;

// Output Schema
export const GetBusinessApplicantOutput =
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
export type GetBusinessApplicantOutput = typeof GetBusinessApplicantOutput.Type;

// The operation
/**
 * Retrieve Business Applicant
 *
 * Retrieve a specific Business Applicant by ID
 *
 * @param id - Business applicant ID
 */
export const getBusinessApplicant = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: GetBusinessApplicantInput,
    outputSchema: GetBusinessApplicantOutput,
    errors: [BadRequest, NotFound] as const,
  }),
);
