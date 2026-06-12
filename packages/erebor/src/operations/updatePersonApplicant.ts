import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const UpdatePersonApplicantInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(T.Http({ method: "PATCH", path: "/person_applicants/{id}" }));
export type UpdatePersonApplicantInput = typeof UpdatePersonApplicantInput.Type;

// Output Schema
export const UpdatePersonApplicantOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["PERSON_APPLICANT"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    program_id: Schema.String,
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
    front_identity_document_id: Schema.optional(Schema.NullOr(Schema.String)),
    back_identity_document_id: Schema.optional(Schema.NullOr(Schema.String)),
    source_of_wealth: Schema.optional(
      Schema.NullOr(
        Schema.Array(
          Schema.Literals([
            "INCOME",
            "OWNERSHIP_STAKE",
            "INVESTMENT_INCOME",
            "INHERITANCE",
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
          Schema.Literals(["INCOME", "ASSET_SALE", "SAVINGS", "OTHER"]),
        ),
      ),
    ),
    source_of_funds_other_description: Schema.optional(
      Schema.NullOr(Schema.String),
    ),
    expected_counterparty_countries: Schema.optional(
      Schema.NullOr(Schema.Array(Schema.String)),
    ),
    expected_fiat_monthly_volume: Schema.optional(Schema.Unknown),
    expected_crypto_monthly_volume: Schema.optional(Schema.Unknown),
    employment_status: Schema.optional(Schema.Unknown),
    annual_income: Schema.optional(Schema.Unknown),
    custom_ref: Schema.optional(Schema.Unknown),
    custom_fields: Schema.optional(Schema.Unknown),
  });
export type UpdatePersonApplicantOutput =
  typeof UpdatePersonApplicantOutput.Type;

// The operation
/**
 * Update Person Applicant
 *
 * Update a person applicant's `custom_ref` or `custom_fields`. Identity fields used for KYC are immutable.
 *
 * @param id - Person applicant ID
 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const updatePersonApplicant = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: UpdatePersonApplicantInput,
    outputSchema: UpdatePersonApplicantOutput,
    errors: [BadRequest, NotFound] as const,
  }),
);
