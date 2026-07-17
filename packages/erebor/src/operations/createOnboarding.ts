import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import {
  BadRequest,
  NotFound,
  Conflict,
  UnprocessableEntity,
  EreborValidationError,
} from "../errors.ts";

// Input Schema
export interface CreateOnboardingInput {
  ereborVersion?: string;
  ereborIdempotencyKey?: string;
  ereborSimulationScenario?: "ONBOARDING_REJECTED" | "ONBOARDING_UNDER_REVIEW";
  program_id?: string;
  person_applicant_id?: string | null;
  business_applicant_id?: string | null;
  deposit_account_template_id?: string;
  disclosures: { disclosures_signed_externally: boolean };
  custom_ref?: string;
  custom_fields?: Record<string, unknown>;
}
export const CreateOnboardingInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
  ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Idempotency-Key"),
  ),
  ereborSimulationScenario: Schema.optional(
    Schema.Literals(["ONBOARDING_REJECTED", "ONBOARDING_UNDER_REVIEW"]),
  ).pipe(T.HttpHeader("Erebor-Simulation-Scenario")),
  program_id: Schema.optional(Schema.String),
  person_applicant_id: Schema.optional(Schema.NullOr(Schema.String)),
  business_applicant_id: Schema.optional(Schema.NullOr(Schema.String)),
  deposit_account_template_id: Schema.optional(Schema.String),
  disclosures: Schema.Struct({
    disclosures_signed_externally: Schema.Boolean,
  }),
  custom_ref: Schema.optional(Schema.String),
  custom_fields: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
}).pipe(
  T.Http({ method: "POST", path: "/onboardings" }),
) as unknown as GeneratedStructCodec<CreateOnboardingInput>;

// Output Schema
export interface CreateOnboardingOutput {
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
export const CreateOnboardingOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
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
  },
) as unknown as GeneratedStructCodec<CreateOnboardingOutput>;

// The operation
/**
 * Create Onboarding
 *
 * Start a new Onboarding for a person or business applicant. A successful Onboarding produces a new Customer, linked in the result.
 * At least one of `deposit_account_template_id` or `program_id` must be provided:
 * - **`deposit_account_template_id` only** — on approval, we create the Customer **and** open an initial deposit account from the template. The customer is placed in the template's program. Use this when you want a turnkey approve→account flow.
 * - **`program_id` only** — on approval, we create only the Customer in the given program. No initial deposit account is opened; open accounts later by calling `POST /deposit_accounts` when the customer is ready to transact.
 * - **Both** — equivalent to providing only `deposit_account_template_id`; the supplied `program_id` is treated as a confirming assertion. Returns `400` if the supplied `program_id` does not match the program the template belongs to.
 * Supplying neither field returns `400`. An unrecognised `program_id` (or one you do not manage) returns `404`.
 * On approval the `ONBOARDING.APPROVED` event always fires. The `DEPOSIT_ACCOUNT.PENDING` / `DEPOSIT_ACCOUNT.OPEN` events only fire when the Onboarding was created with `deposit_account_template_id` (either alone or alongside a matching `program_id`).
 *
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param ereborIdempotencyKey - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 * @param ereborSimulationScenario - **Sandbox only.** Forces a simulated onboarding outcome so you can exercise success and failure paths. Ignored in production, where onboardings always go through real review.

| Value | Outcome |
|-------|---------|
| `ONBOARDING_REJECTED` | The Onboarding status is set to `REJECTED`. No Customer or Deposit Account is created. |
| `ONBOARDING_UNDER_REVIEW` | The Onboarding status is set to `UNDER_REVIEW`. |
| _(omitted)_ | The Onboarding status is set to `APPROVED` (and opens the initial Deposit Account when `deposit_account_template_id` was supplied). |

An unrecognized value is rejected with `400`. The header name aligns with the platform's `/simulation/` endpoints.

 */
export const createOnboarding = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateOnboardingInput,
  outputSchema: CreateOnboardingOutput,
  errors: [
    BadRequest,
    NotFound,
    Conflict,
    UnprocessableEntity,
    EreborValidationError,
  ] as const,
}));
