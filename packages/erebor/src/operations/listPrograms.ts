import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";

// Input Schema
export interface ListProgramsInput {
  page_size?: number;
  starting_after?: string;
  ending_before?: string;
  ereborVersion?: string;
}
export const ListProgramsInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  page_size: Schema.optional(Schema.Number).pipe(T.HttpQuery("page_size")),
  starting_after: Schema.optional(Schema.String).pipe(
    T.HttpQuery("starting_after"),
  ),
  ending_before: Schema.optional(Schema.String).pipe(
    T.HttpQuery("ending_before"),
  ),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
}).pipe(
  T.Http({ method: "GET", path: "/programs" }),
) as unknown as GeneratedStructCodec<ListProgramsInput>;

// Output Schema
export interface ListProgramsOutput {
  data: ReadonlyArray<{
    id: string;
    type: "PROGRAM";
    url: string;
    created_at: string;
    updated_at: string;
    archived_at?: string | null;
    name: string;
    billing_deposit_account_id?: string;
    program_type?: string | null;
  }>;
  has_more: boolean;
  page_size: number;
  page_next?: string | null;
  page_prev?: string | null;
  url: string;
}
export const ListProgramsOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      type: Schema.Literals(["PROGRAM"]),
      url: Schema.String,
      created_at: Schema.String,
      updated_at: Schema.String,
      archived_at: Schema.optional(Schema.NullOr(Schema.String)),
      name: Schema.String,
      billing_deposit_account_id: Schema.optional(Schema.String),
      program_type: Schema.optional(Schema.NullOr(Schema.String)),
    }),
  ),
  has_more: Schema.Boolean,
  page_size: Schema.Number,
  page_next: Schema.optional(Schema.NullOr(Schema.String)),
  page_prev: Schema.optional(Schema.NullOr(Schema.String)),
  url: Schema.String,
}) as unknown as GeneratedStructCodec<ListProgramsOutput>;

// The operation
/**
 * List Programs
 *
 * Retrieve a paginated list of Programs
 *
 * @param page_size - Number of items per page (max 100)
 * @param starting_after - Cursor for pagination (exclusive start)
 * @param ending_before - Cursor for pagination (exclusive end)
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const listPrograms = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListProgramsInput,
  outputSchema: ListProgramsOutput,
}));
