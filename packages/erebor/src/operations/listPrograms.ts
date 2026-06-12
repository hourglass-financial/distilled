import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";

// Input Schema
export const ListProgramsInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  page_size: Schema.optional(Schema.Number),
  starting_after: Schema.optional(Schema.String),
  ending_before: Schema.optional(Schema.String),
}).pipe(T.Http({ method: "GET", path: "/programs" }));
export type ListProgramsInput = typeof ListProgramsInput.Type;

// Output Schema
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
      billing_deposit_account_id: Schema.String,
    }),
  ),
  has_more: Schema.Boolean,
  page_size: Schema.Number,
  page_next: Schema.optional(Schema.NullOr(Schema.String)),
  page_prev: Schema.optional(Schema.NullOr(Schema.String)),
  url: Schema.String,
});
export type ListProgramsOutput = typeof ListProgramsOutput.Type;

// The operation
/**
 * List Programs
 *
 * Retrieve a paginated list of Programs
 *
 * @param page_size - Number of items per page (max 100)
 * @param starting_after - Cursor for pagination (exclusive start)
 * @param ending_before - Cursor for pagination (exclusive end)
 */
export const listPrograms = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListProgramsInput,
  outputSchema: ListProgramsOutput,
}));
