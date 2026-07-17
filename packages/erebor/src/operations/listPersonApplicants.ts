import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";

// Input Schema
export interface ListPersonApplicantsInput {
  page_size?: number;
  starting_after?: string;
  ending_before?: string;
  program_id?: string;
  custom_ref?: string;
  ereborVersion?: string;
}
export const ListPersonApplicantsInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    page_size: Schema.optional(Schema.Number).pipe(T.HttpQuery("page_size")),
    starting_after: Schema.optional(Schema.String).pipe(
      T.HttpQuery("starting_after"),
    ),
    ending_before: Schema.optional(Schema.String).pipe(
      T.HttpQuery("ending_before"),
    ),
    program_id: Schema.optional(Schema.String).pipe(T.HttpQuery("program_id")),
    custom_ref: Schema.optional(Schema.String).pipe(T.HttpQuery("custom_ref")),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/person_applicants" }),
  ) as unknown as GeneratedStructCodec<ListPersonApplicantsInput>;

// Output Schema
export interface ListPersonApplicantsOutput {
  data: ReadonlyArray<{
    id: string;
    type: "PERSON_APPLICANT";
    url: string;
    created_at: string;
    updated_at: string;
    archived_at?: string | null;
    program_id: string;
    person_applicant_type?:
      | "LEGACY"
      | "RETAIL_CUSTOMER"
      | "HNWI_CUSTOMER"
      | "ASSOCIATED_PERSON"
      | null;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    citizenship?: string | null;
    date_of_birth: string;
    email_address?: string | null;
    phone_number?: string | null;
    physical_address: {
      street_address: string;
      city: string;
      country_area?: string | null;
      postal_code: string;
      country: string;
    };
    mailing_address?: {
      street_address: string;
      city: string;
      country_area?: string | null;
      postal_code: string;
      country: string;
    };
    tin?: string | null;
    front_identity_document_id?: string | null;
    back_identity_document_id?: string | null;
    source_of_wealth?: ReadonlyArray<
      | "CRYPTO"
      | "SALE_OF_BUSINESS"
      | "OWNERSHIP_STAKE"
      | "INVESTMENT_INCOME"
      | "REAL_ESTATE"
      | "EXECUTIVE"
      | "INHERITANCE"
      | "INCOME"
      | "INTELLECTUAL"
      | "OTHER"
    > | null;
    source_of_wealth_other_description?: string | null;
    account_purposes?: ReadonlyArray<
      | "PERSONAL_BANKING"
      | "INVESTMENTS"
      | "CROSS_BORDER_PAYMENTS"
      | "STABLECOIN_CONVERSION"
      | "OTHER"
    > | null;
    account_purposes_other_description?: string | null;
    source_of_funds?: ReadonlyArray<
      "INCOME" | "ASSET_SALE" | "FINANCING" | "SAVINGS" | "OTHER"
    > | null;
    source_of_funds_other_description?: string | null;
    expected_counterparty_countries?: ReadonlyArray<string> | null;
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
    employment_status?: "FULL_TIME" | "PART_TIME" | "UNEMPLOYED" | null;
    annual_income?: {
      currency: string;
      exponent?: number;
      value: string;
      display_value?: string;
    } | null;
    custom_ref?: string | null;
    custom_fields?: Record<string, unknown> | null;
  }>;
  has_more: boolean;
  page_size: number;
  page_next?: string | null;
  page_prev?: string | null;
  url: string;
}
export const ListPersonApplicantsOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
        id: Schema.String,
        type: Schema.Literals(["PERSON_APPLICANT"]),
        url: Schema.String,
        created_at: Schema.String,
        updated_at: Schema.String,
        archived_at: Schema.optional(Schema.NullOr(Schema.String)),
        program_id: Schema.String,
        person_applicant_type: Schema.optional(
          Schema.NullOr(
            Schema.Literals([
              "LEGACY",
              "RETAIL_CUSTOMER",
              "HNWI_CUSTOMER",
              "ASSOCIATED_PERSON",
            ]),
          ),
        ),
        first_name: Schema.String,
        middle_name: Schema.optional(Schema.NullOr(Schema.String)),
        last_name: Schema.String,
        citizenship: Schema.optional(Schema.NullOr(Schema.String)),
        date_of_birth: Schema.String,
        email_address: Schema.optional(Schema.NullOr(Schema.String)),
        phone_number: Schema.optional(Schema.NullOr(Schema.String)),
        physical_address: Schema.Struct({
          street_address: Schema.String,
          city: Schema.String,
          country_area: Schema.optional(Schema.NullOr(Schema.String)),
          postal_code: Schema.String,
          country: Schema.String,
        }),
        mailing_address: Schema.optional(
          Schema.Struct({
            street_address: Schema.String,
            city: Schema.String,
            country_area: Schema.optional(Schema.NullOr(Schema.String)),
            postal_code: Schema.String,
            country: Schema.String,
          }),
        ),
        tin: Schema.optional(Schema.NullOr(Schema.String)),
        front_identity_document_id: Schema.optional(
          Schema.NullOr(Schema.String),
        ),
        back_identity_document_id: Schema.optional(
          Schema.NullOr(Schema.String),
        ),
        source_of_wealth: Schema.optional(
          Schema.NullOr(
            Schema.Array(
              Schema.Literals([
                "CRYPTO",
                "SALE_OF_BUSINESS",
                "OWNERSHIP_STAKE",
                "INVESTMENT_INCOME",
                "REAL_ESTATE",
                "EXECUTIVE",
                "INHERITANCE",
                "INCOME",
                "INTELLECTUAL",
                "OTHER",
              ]),
            ),
          ),
        ),
        source_of_wealth_other_description: Schema.optional(
          Schema.NullOr(Schema.String),
        ),
        account_purposes: Schema.optional(
          Schema.NullOr(
            Schema.Array(
              Schema.Literals([
                "PERSONAL_BANKING",
                "INVESTMENTS",
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
        source_of_funds: Schema.optional(
          Schema.NullOr(
            Schema.Array(
              Schema.Literals([
                "INCOME",
                "ASSET_SALE",
                "FINANCING",
                "SAVINGS",
                "OTHER",
              ]),
            ),
          ),
        ),
        source_of_funds_other_description: Schema.optional(
          Schema.NullOr(Schema.String),
        ),
        expected_counterparty_countries: Schema.optional(
          Schema.NullOr(Schema.Array(Schema.String)),
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
        employment_status: Schema.optional(
          Schema.NullOr(
            Schema.Literals(["FULL_TIME", "PART_TIME", "UNEMPLOYED"]),
          ),
        ),
        annual_income: Schema.optional(
          Schema.NullOr(
            Schema.Struct({
              currency: Schema.String,
              exponent: Schema.optional(Schema.Number),
              value: Schema.String,
              display_value: Schema.optional(Schema.String),
            }),
          ),
        ),
        custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
        custom_fields: Schema.optional(
          Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
        ),
      }),
    ),
    has_more: Schema.Boolean,
    page_size: Schema.Number,
    page_next: Schema.optional(Schema.NullOr(Schema.String)),
    page_prev: Schema.optional(Schema.NullOr(Schema.String)),
    url: Schema.String,
  }) as unknown as GeneratedStructCodec<ListPersonApplicantsOutput>;

// The operation
/**
 * List Person Applicants
 *
 * Retrieve a list of Person Applicants
 *
 * @param page_size - Number of items per page (max 100)
 * @param starting_after - Cursor for pagination (exclusive start)
 * @param ending_before - Cursor for pagination (exclusive end)
 * @param program_id - Filter by program ID
 * @param custom_ref - Filter by exact `custom_ref` match (case-sensitive, up to 255 characters).
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const listPersonApplicants = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: ListPersonApplicantsInput,
    outputSchema: ListPersonApplicantsOutput,
  }),
);
