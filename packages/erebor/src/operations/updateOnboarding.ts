import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const UpdateOnboardingInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String.pipe(T.PathParam()),
  ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Idempotency-Key"),
  ),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
  custom_ref: Schema.optional(Schema.String),
  custom_fields: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
}).pipe(T.Http({ method: "PATCH", path: "/onboardings/{id}" }));
export type UpdateOnboardingInput = typeof UpdateOnboardingInput.Type;

// Output Schema
export const UpdateOnboardingOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
  {
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
  },
);
export type UpdateOnboardingOutput = typeof UpdateOnboardingOutput.Type;

// The operation
/**
 * Update Onboarding
 *
 * Update an onboarding's `custom_ref` or `custom_fields`. Status, applicant, and program are immutable.
 *
 * @param id - Onboarding ID
 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 * @param Erebor-Version - Optional API version header. Use a date-based Erebor API version when you need to pin request behavior.
 */
export const updateOnboarding = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateOnboardingInput,
  outputSchema: UpdateOnboardingOutput,
  errors: [BadRequest, NotFound] as const,
}));
