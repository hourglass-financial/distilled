import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";

// Input Schema
export interface ListOnboardingsInput {
  page_size?: number;
  starting_after?: string;
  ending_before?: string;
  program_id?: string;
  custom_ref?: string;
  ereborVersion?: string;
}
export const ListOnboardingsInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  page_size: Schema.optional(Schema.Number),
  starting_after: Schema.optional(Schema.String),
  ending_before: Schema.optional(Schema.String),
  program_id: Schema.optional(Schema.String),
  custom_ref: Schema.optional(Schema.String),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
}).pipe(
  T.Http({ method: "GET", path: "/onboardings" }),
) as unknown as Schema.Codec<ListOnboardingsInput>;

// Output Schema
export interface ListOnboardingsOutput {
  data: ReadonlyArray<{
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
  }>;
  has_more: boolean;
  page_size: number;
  page_next?: string | null;
  page_prev?: string | null;
  url: string;
}
export const ListOnboardingsOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
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
      deposit_account_template_id: Schema.optional(
        Schema.NullOr(Schema.String),
      ),
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
    }),
  ),
  has_more: Schema.Boolean,
  page_size: Schema.Number,
  page_next: Schema.optional(Schema.NullOr(Schema.String)),
  page_prev: Schema.optional(Schema.NullOr(Schema.String)),
  url: Schema.String,
}) as unknown as Schema.Codec<ListOnboardingsOutput>;

// The operation
/**
 * List Onboardings
 *
 * Retrieve a list of Customer Onboardings
 *
 * @param page_size - Number of items per page (max 100)
 * @param starting_after - Cursor for pagination (exclusive start)
 * @param ending_before - Cursor for pagination (exclusive end)
 * @param program_id - Filter by program ID
 * @param custom_ref - Filter by exact `custom_ref` match (case-sensitive, up to 255 characters).
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const listOnboardings = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListOnboardingsInput,
  outputSchema: ListOnboardingsOutput,
}));
