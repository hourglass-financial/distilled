import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface GetBusinessApplicantInput {
  id: string;
  ereborVersion?: string;
}
export const GetBusinessApplicantInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/business_applicants/{id}" }),
  ) as unknown as Schema.Codec<GetBusinessApplicantInput>;

// Output Schema
export interface GetBusinessApplicantOutput {
  id: string;
  type: "BUSINESS_APPLICANT";
  url: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  program_id: string;
  name: string;
  dba_name?: string | null;
  legal_entity_type?:
    | "CORPORATION"
    | "JOINT_VENTURE"
    | "LLC"
    | "LLP"
    | "LP"
    | "NON_PROFIT"
    | "PARTNERSHIP"
    | "TRUST"
    | "SOLE_PROPRIETORSHIP"
    | "PRIVATE_LIMITED_COMPANY"
    | "SPV"
    | "GOVERNMENT_ENTITY"
    | null;
  incorporation_address: {
    street_address: string;
    city: string;
    country_area?: string | null;
    postal_code: string;
    country: string;
  };
  incorporation_date?: string | null;
  tin?: string | null;
  description?: string | null;
  industry?:
    | "BANK"
    | "CONSTRUCTION"
    | "CRYPTO"
    | "DEFENSE"
    | "E_COMMERCE"
    | "ENERGY"
    | "ENTERTAINMENT"
    | "FINANCIAL_SERVICES"
    | "FINANCIAL_TRADING"
    | "GAMBLING"
    | "HEALTH"
    | "HOLDING_COMPANY"
    | "MANUFACTURING"
    | "NONPROFIT"
    | "OPERATING_COMPANY"
    | "PAYMENTS"
    | "PROFESSIONAL_SERVICES"
    | "REAL_ESTATE"
    | "TECHNOLOGY"
    | "TRADE"
    | "OTHER"
    | null;
  industry_financial_services_subtype?:
    | "GAMING"
    | "CROWD_FUNDING"
    | "BANK"
    | "FUND"
    | "INSURANCE"
    | "RIA"
    | "INVESTMENT_MANAGER"
    | "MSB"
    | "NBFI"
    | "PAYMENT_PROCESSOR"
    | "VASP"
    | null;
  industry_crypto_subtype?:
    | "PROTOCOL"
    | "EXCHANGE"
    | "INVESTMENT"
    | "LENDER"
    | "MARKET_MAKER"
    | "SAAS"
    | "MINER"
    | null;
  industry_other_description?: string | null;
  website_url?: string | null;
  phone_number?: string | null;
  physical_address: {
    street_address: string;
    city: string;
    country_area?: string | null;
    postal_code: string;
    country: string;
  };
  expected_counterparty_countries?: ReadonlyArray<string> | null;
  source_of_funds?: ReadonlyArray<
    "REVENUE" | "INVESTMENT" | "INHERITANCE" | "GIFT" | "OTHER"
  > | null;
  source_of_funds_other_description?: string | null;
  associated_persons?: ReadonlyArray<{
    person_applicant_id: string;
    title: string;
    roles: ReadonlyArray<
      "CONTROL_PERSON" | "BENEFICIAL_OWNER" | "SIGNER" | "APPLICANT"
    >;
    ownership_percentage: number;
  }>;
  formation_document_id?: string | null;
  tin_verification_document_id?: string | null;
  authorization_document_id?: string | null;
  is_msb?: boolean | null;
  account_purposes?: ReadonlyArray<
    | "BUSINESS_OPERATIONS"
    | "CAPITAL_DEPLOYMENT"
    | "CROSS_BORDER_PAYMENTS"
    | "STABLECOIN_CONVERSION"
    | "OTHER"
  > | null;
  account_purposes_other_description?: string | null;
  primary_target_market?:
    | "COMMERCIAL"
    | "RETAIL"
    | "GOVERNMENT"
    | "OTHER"
    | null;
  primary_target_market_other_description?: string | null;
  expected_fiat_monthly_volume?:
    | "LESS_THAN_5K"
    | "5K_TO_50K"
    | "50K_TO_500K"
    | "500K_TO_5M"
    | "ABOVE_5M"
    | null;
  expected_crypto_monthly_volume?:
    | "LESS_THAN_5K"
    | "5K_TO_50K"
    | "50K_TO_500K"
    | "500K_TO_5M"
    | "ABOVE_5M"
    | "NONE"
    | null;
  custom_ref?: string | null;
  custom_fields?: Record<string, unknown> | null;
}
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
    legal_entity_type: Schema.optional(
      Schema.NullOr(
        Schema.Literals([
          "CORPORATION",
          "JOINT_VENTURE",
          "LLC",
          "LLP",
          "LP",
          "NON_PROFIT",
          "PARTNERSHIP",
          "TRUST",
          "SOLE_PROPRIETORSHIP",
          "PRIVATE_LIMITED_COMPANY",
          "SPV",
          "GOVERNMENT_ENTITY",
        ]),
      ),
    ),
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
    industry: Schema.optional(
      Schema.NullOr(
        Schema.Literals([
          "BANK",
          "CONSTRUCTION",
          "CRYPTO",
          "DEFENSE",
          "E_COMMERCE",
          "ENERGY",
          "ENTERTAINMENT",
          "FINANCIAL_SERVICES",
          "FINANCIAL_TRADING",
          "GAMBLING",
          "HEALTH",
          "HOLDING_COMPANY",
          "MANUFACTURING",
          "NONPROFIT",
          "OPERATING_COMPANY",
          "PAYMENTS",
          "PROFESSIONAL_SERVICES",
          "REAL_ESTATE",
          "TECHNOLOGY",
          "TRADE",
          "OTHER",
        ]),
      ),
    ),
    industry_financial_services_subtype: Schema.optional(
      Schema.NullOr(
        Schema.Literals([
          "GAMING",
          "CROWD_FUNDING",
          "BANK",
          "FUND",
          "INSURANCE",
          "RIA",
          "INVESTMENT_MANAGER",
          "MSB",
          "NBFI",
          "PAYMENT_PROCESSOR",
          "VASP",
        ]),
      ),
    ),
    industry_crypto_subtype: Schema.optional(
      Schema.NullOr(
        Schema.Literals([
          "PROTOCOL",
          "EXCHANGE",
          "INVESTMENT",
          "LENDER",
          "MARKET_MAKER",
          "SAAS",
          "MINER",
        ]),
      ),
    ),
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
        Schema.Array(
          Schema.Literals([
            "REVENUE",
            "INVESTMENT",
            "INHERITANCE",
            "GIFT",
            "OTHER",
          ]),
        ),
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
            Schema.Literals([
              "CONTROL_PERSON",
              "BENEFICIAL_OWNER",
              "SIGNER",
              "APPLICANT",
            ]),
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
    primary_target_market: Schema.optional(
      Schema.NullOr(
        Schema.Literals(["COMMERCIAL", "RETAIL", "GOVERNMENT", "OTHER"]),
      ),
    ),
    primary_target_market_other_description: Schema.optional(
      Schema.NullOr(Schema.String),
    ),
    expected_fiat_monthly_volume: Schema.optional(
      Schema.NullOr(
        Schema.Literals([
          "LESS_THAN_5K",
          "5K_TO_50K",
          "50K_TO_500K",
          "500K_TO_5M",
          "ABOVE_5M",
        ]),
      ),
    ),
    expected_crypto_monthly_volume: Schema.optional(
      Schema.NullOr(
        Schema.Literals([
          "LESS_THAN_5K",
          "5K_TO_50K",
          "50K_TO_500K",
          "500K_TO_5M",
          "ABOVE_5M",
          "NONE",
        ]),
      ),
    ),
    custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
    custom_fields: Schema.optional(
      Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
    ),
  }) as unknown as Schema.Codec<GetBusinessApplicantOutput>;

// The operation
/**
 * Retrieve Business Applicant
 *
 * Retrieve a specific Business Applicant by ID
 *
 * @param id - Business applicant ID
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getBusinessApplicant = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: GetBusinessApplicantInput,
    outputSchema: GetBusinessApplicantOutput,
    errors: [BadRequest, NotFound] as const,
  }),
);
