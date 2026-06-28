import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";

// Input Schema
export const ListBusinessApplicantsInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    page_size: Schema.optional(Schema.Number),
    starting_after: Schema.optional(Schema.String),
    ending_before: Schema.optional(Schema.String),
    program_id: Schema.optional(Schema.String),
    custom_ref: Schema.optional(Schema.String),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(T.Http({ method: "GET", path: "/business_applicants" }));
export type ListBusinessApplicantsInput =
  typeof ListBusinessApplicantsInput.Type;

// Output Schema
export const ListBusinessApplicantsOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
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
        industry_other_description: Schema.optional(
          Schema.NullOr(Schema.String),
        ),
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
        tin_verification_document_id: Schema.optional(
          Schema.NullOr(Schema.String),
        ),
        authorization_document_id: Schema.optional(
          Schema.NullOr(Schema.String),
        ),
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
      }),
    ),
    has_more: Schema.Boolean,
    page_size: Schema.Number,
    page_next: Schema.optional(Schema.NullOr(Schema.String)),
    page_prev: Schema.optional(Schema.NullOr(Schema.String)),
    url: Schema.String,
  });
export type ListBusinessApplicantsOutput =
  typeof ListBusinessApplicantsOutput.Type;

// The operation
/**
 * List Business Applicants
 *
 * Retrieve a list of Business Applicants
 *
 * @param page_size - Number of items per page (max 100)
 * @param starting_after - Cursor for pagination (exclusive start)
 * @param ending_before - Cursor for pagination (exclusive end)
 * @param program_id - Filter by program ID
 * @param custom_ref - Filter by exact `custom_ref` match (case-sensitive, up to 255 characters).
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const listBusinessApplicants = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: ListBusinessApplicantsInput,
    outputSchema: ListBusinessApplicantsOutput,
  }),
);
