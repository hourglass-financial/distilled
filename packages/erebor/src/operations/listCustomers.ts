import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";

// Input Schema
export interface ListCustomersInput {
  page_size?: number;
  starting_after?: string;
  ending_before?: string;
  status?: "ACTIVE" | "OFFBOARDED";
  program_id?: string;
  custom_ref?: string;
  ereborVersion?: string;
}
export const ListCustomersInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  page_size: Schema.optional(Schema.Number).pipe(T.HttpQuery("page_size")),
  starting_after: Schema.optional(Schema.String).pipe(
    T.HttpQuery("starting_after"),
  ),
  ending_before: Schema.optional(Schema.String).pipe(
    T.HttpQuery("ending_before"),
  ),
  status: Schema.optional(Schema.Literals(["ACTIVE", "OFFBOARDED"])).pipe(
    T.HttpQuery("status"),
  ),
  program_id: Schema.optional(Schema.String).pipe(T.HttpQuery("program_id")),
  custom_ref: Schema.optional(Schema.String).pipe(T.HttpQuery("custom_ref")),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
}).pipe(
  T.Http({ method: "GET", path: "/customers" }),
) as unknown as GeneratedStructCodec<ListCustomersInput>;

// Output Schema
export interface ListCustomersOutput {
  data: ReadonlyArray<{
    id: string;
    type: "CUSTOMER";
    url: string;
    created_at: string;
    updated_at: string;
    archived_at?: string | null;
    program_id?: string | null;
    status: "ACTIVE" | "OFFBOARDED";
    name: string;
    onboarding_id?: string | null;
    custom_ref?: string | null;
    custom_fields?: Record<string, unknown> | null;
  }>;
  has_more: boolean;
  page_size: number;
  page_next?: string | null;
  page_prev?: string | null;
  url: string;
}
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
}) as unknown as GeneratedStructCodec<ListCustomersOutput>;

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
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const listCustomers = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListCustomersInput,
  outputSchema: ListCustomersOutput,
}));
