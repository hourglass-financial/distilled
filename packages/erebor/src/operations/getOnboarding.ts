import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const GetOnboardingInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String.pipe(T.PathParam()),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
}).pipe(T.Http({ method: "GET", path: "/onboardings/{id}" }));
export type GetOnboardingInput = typeof GetOnboardingInput.Type;

// Output Schema
export const GetOnboardingOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String,
  type: Schema.Literals(["ONBOARDING"]),
  url: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  archived_at: Schema.optional(Schema.NullOr(Schema.String)),
  program_id: Schema.String,
  status: Schema.Literals([
    "SUBMITTED",
    "UNDER_REVIEW",
    "APPROVED",
    "REJECTED",
  ]),
  applicant_type: Schema.Literals(["PERSON", "BUSINESS"]),
  person_applicant_id: Schema.optional(Schema.NullOr(Schema.String)),
  business_applicant_id: Schema.optional(Schema.NullOr(Schema.String)),
  deposit_account_template_id: Schema.optional(Schema.NullOr(Schema.String)),
  disclosures: Schema.Struct({
    disclosures_signed_externally: Schema.Boolean,
  }),
  customer_id: Schema.optional(Schema.NullOr(Schema.String)),
  deposit_account_id: Schema.optional(Schema.NullOr(Schema.String)),
  custom_ref: Schema.optional(Schema.Unknown),
  custom_fields: Schema.optional(Schema.Unknown),
});
export type GetOnboardingOutput = typeof GetOnboardingOutput.Type;

// The operation
/**
 * Retrieve Onboarding
 *
 * Retrieve a specific Onboarding process by ID
 *
 * @param id - Onboarding ID
 * @param Erebor-Version - Optional API version header. Use a date-based Erebor API version when you need to pin request behavior.
 */
export const getOnboarding = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetOnboardingInput,
  outputSchema: GetOnboardingOutput,
  errors: [BadRequest, NotFound] as const,
}));
