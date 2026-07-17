import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";

// Input Schema
export interface ListAccountNumbersInput {
  page_size?: number;
  starting_after?: string;
  ending_before?: string;
  deposit_account_id?: string;
  custom_ref?: string;
  ereborVersion?: string;
}
export const ListAccountNumbersInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    page_size: Schema.optional(Schema.Number).pipe(T.HttpQuery("page_size")),
    starting_after: Schema.optional(Schema.String).pipe(
      T.HttpQuery("starting_after"),
    ),
    ending_before: Schema.optional(Schema.String).pipe(
      T.HttpQuery("ending_before"),
    ),
    deposit_account_id: Schema.optional(Schema.String).pipe(
      T.HttpQuery("deposit_account_id"),
    ),
    custom_ref: Schema.optional(Schema.String).pipe(T.HttpQuery("custom_ref")),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/account_numbers" }),
  ) as unknown as GeneratedStructCodec<ListAccountNumbersInput>;

// Output Schema
export interface ListAccountNumbersOutput {
  data: ReadonlyArray<{
    id: string;
    type: "ACCOUNT_NUMBER";
    url: string;
    created_at: string;
    updated_at: string;
    archived_at?: string | null;
    program_id?: string | null;
    deposit_account_id: string;
    name?: string | null;
    account_number: string;
    routing_number: string;
    default: boolean;
    custom_ref?: string | null;
    custom_fields?: Record<string, unknown> | null;
  }>;
  has_more: boolean;
  page_size: number;
  page_next?: string | null;
  page_prev?: string | null;
  url: string;
}
export const ListAccountNumbersOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
        id: Schema.String,
        type: Schema.Literals(["ACCOUNT_NUMBER"]),
        url: Schema.String,
        created_at: Schema.String,
        updated_at: Schema.String,
        archived_at: Schema.optional(Schema.NullOr(Schema.String)),
        program_id: Schema.optional(Schema.NullOr(Schema.String)),
        deposit_account_id: Schema.String,
        name: Schema.optional(Schema.NullOr(Schema.String)),
        account_number: Schema.String,
        routing_number: Schema.String,
        default: Schema.Boolean,
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
  }) as unknown as GeneratedStructCodec<ListAccountNumbersOutput>;

// The operation
/**
 * List Account Numbers
 *
 * Retrieve a paginated list of Account Numbers
 *
 * @param page_size - Number of items per page (max 100)
 * @param starting_after - Cursor for pagination (exclusive start)
 * @param ending_before - Cursor for pagination (exclusive end)
 * @param custom_ref - Filter by exact `custom_ref` match (case-sensitive, up to 255 characters).
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const listAccountNumbers = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListAccountNumbersInput,
  outputSchema: ListAccountNumbersOutput,
}));
