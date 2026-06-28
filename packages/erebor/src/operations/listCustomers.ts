import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";

// Input Schema
export const ListCustomersInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  page_size: Schema.optional(Schema.Number),
  starting_after: Schema.optional(Schema.String),
  ending_before: Schema.optional(Schema.String),
  status: Schema.optional(Schema.String),
  program_id: Schema.optional(Schema.String),
  custom_ref: Schema.optional(Schema.String),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
}).pipe(T.Http({ method: "GET", path: "/customers" }));
export type ListCustomersInput = typeof ListCustomersInput.Type;

// Output Schema
export const ListCustomersOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      type: Schema.Literals(["CUSTOMER"]),
      url: Schema.String,
      created_at: Schema.String,
      updated_at: Schema.String,
      archived_at: Schema.optional(Schema.NullOr(Schema.String)),
      program_id: Schema.optional(Schema.NullOr(Schema.String)),
      status: Schema.Literals(["ACTIVE", "OFFBOARDED"]),
      name: Schema.String,
      onboarding_id: Schema.optional(Schema.NullOr(Schema.String)),
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
export type ListCustomersOutput = typeof ListCustomersOutput.Type;

// The operation
/**
 * List Customers
 *
 * Retrieve a paginated list of Customers
 *
 * @param page_size - Number of items per page (max 100)
 * @param starting_after - Cursor for pagination (exclusive start)
 * @param ending_before - Cursor for pagination (exclusive end)
 * @param program_id - Filter by program ID
 * @param custom_ref - Filter by exact `custom_ref` match (case-sensitive, up to 255 characters).
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const listCustomers = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListCustomersInput,
  outputSchema: ListCustomersOutput,
}));
