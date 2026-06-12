import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";

// Input Schema
export const ListOnboardingsInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  page_size: Schema.optional(Schema.Number),
  starting_after: Schema.optional(Schema.String),
  ending_before: Schema.optional(Schema.String),
  program_id: Schema.optional(Schema.String),
  custom_ref: Schema.optional(Schema.String),
}).pipe(T.Http({ method: "GET", path: "/onboardings" }));
export type ListOnboardingsInput = typeof ListOnboardingsInput.Type;

// Output Schema
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
      disclosures: Schema.Struct({
        disclosures_signed_externally: Schema.Boolean,
      }),
      customer_id: Schema.optional(Schema.NullOr(Schema.String)),
      deposit_account_id: Schema.optional(Schema.NullOr(Schema.String)),
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
export type ListOnboardingsOutput = typeof ListOnboardingsOutput.Type;

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
 */
export const listOnboardings = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListOnboardingsInput,
  outputSchema: ListOnboardingsOutput,
}));
