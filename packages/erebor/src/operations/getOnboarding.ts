import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface GetOnboardingInput {
  id: string;
  ereborVersion?: string;
}
export const GetOnboardingInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String.pipe(T.PathParam()),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
}).pipe(
  T.Http({ method: "GET", path: "/onboardings/{id}" }),
) as unknown as GeneratedStructCodec<GetOnboardingInput>;

// Output Schema
export interface GetOnboardingOutput {
  id: string;
  type: "ONBOARDING";
  url: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  program_id: string;
  status: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  applicant_type: "PERSON" | "BUSINESS";
  person_applicant_id?: string | null;
  business_applicant_id?: string | null;
  deposit_account_template_id?: string | null;
  disclosures?: { disclosures_signed_externally: boolean };
  customer_id?: string | null;
  deposit_account_id?: string | null;
  custom_ref?: string | null;
  custom_fields?: Record<string, unknown> | null;
  rejection_reason?: string | null;
}
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
  disclosures: Schema.optional(
    Schema.Struct({
      disclosures_signed_externally: Schema.Boolean,
    }),
  ),
  customer_id: Schema.optional(Schema.NullOr(Schema.String)),
  deposit_account_id: Schema.optional(Schema.NullOr(Schema.String)),
  custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
  custom_fields: Schema.optional(
    Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
  ),
  rejection_reason: Schema.optional(Schema.NullOr(Schema.String)),
}) as unknown as GeneratedStructCodec<GetOnboardingOutput>;

// The operation
/**
 * Retrieve Onboarding
 *
 * Retrieve a specific Onboarding process by ID
 *
 * @param id - Onboarding ID
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getOnboarding = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetOnboardingInput,
  outputSchema: GetOnboardingOutput,
  errors: [BadRequest, NotFound] as const,
}));
