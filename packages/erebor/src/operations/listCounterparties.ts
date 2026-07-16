import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";

// Input Schema
export interface ListCounterpartiesInput {
  page_size?: number;
  starting_after?: string;
  ending_before?: string;
  customer_id?: string;
  program_id?: string;
  custom_ref?: string;
  ereborVersion?: string;
}
export const ListCounterpartiesInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    page_size: Schema.optional(Schema.Number),
    starting_after: Schema.optional(Schema.String),
    ending_before: Schema.optional(Schema.String),
    customer_id: Schema.optional(Schema.String),
    program_id: Schema.optional(Schema.String),
    custom_ref: Schema.optional(Schema.String),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/counterparties" }),
  ) as unknown as Schema.Codec<ListCounterpartiesInput>;

// Output Schema
export interface ListCounterpartiesOutput {
  data: ReadonlyArray<{
    id: string;
    type: "COUNTERPARTY";
    url: string;
    created_at: string;
    updated_at: string;
    archived_at?: string | null;
    customer_id?: string | null;
    program_id?: string | null;
    name: string;
    address: {
      street_address: string;
      city: string;
      country_area?: string | null;
      postal_code: string;
      country: string;
    };
    custom_ref?: string | null;
    custom_fields?: Record<string, unknown> | null;
  }>;
  has_more: boolean;
  page_size: number;
  page_next?: string | null;
  page_prev?: string | null;
  url: string;
}
export const ListCounterpartiesOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
        id: Schema.String,
        type: Schema.Literals(["COUNTERPARTY"]),
        url: Schema.String,
        created_at: Schema.String,
        updated_at: Schema.String,
        archived_at: Schema.optional(Schema.NullOr(Schema.String)),
        customer_id: Schema.optional(Schema.NullOr(Schema.String)),
        program_id: Schema.optional(Schema.NullOr(Schema.String)),
        name: Schema.String,
        address: Schema.Struct({
          street_address: Schema.String,
          city: Schema.String,
          country_area: Schema.optional(Schema.NullOr(Schema.String)),
          postal_code: Schema.String,
          country: Schema.String,
        }),
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
  }) as unknown as Schema.Codec<ListCounterpartiesOutput>;

// The operation
/**
 * List Counterparties
 *
 * Retrieve a paginated list of Counterparties
 *
 * @param page_size - Number of items per page (max 100)
 * @param starting_after - Cursor for pagination (exclusive start)
 * @param ending_before - Cursor for pagination (exclusive end)
 * @param customer_id - Filter by customer ID
 * @param program_id - Filter by program ID
 * @param custom_ref - Filter by exact `custom_ref` match (case-sensitive, up to 255 characters).
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const listCounterparties = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListCounterpartiesInput,
  outputSchema: ListCounterpartiesOutput,
}));
