import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";

// Input Schema
export const ListDepositAccountTemplatesInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    page_size: Schema.optional(Schema.Number),
    starting_after: Schema.optional(Schema.String),
    ending_before: Schema.optional(Schema.String),
    deposit_account_type: Schema.optional(Schema.String),
    ownership_type: Schema.optional(Schema.String),
    status: Schema.optional(Schema.String),
    program_id: Schema.optional(Schema.String),
  }).pipe(T.Http({ method: "GET", path: "/deposit_account_templates" }));
export type ListDepositAccountTemplatesInput =
  typeof ListDepositAccountTemplatesInput.Type;

// Output Schema
export const ListDepositAccountTemplatesOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
        id: Schema.String,
        type: Schema.Literals(["DEPOSIT_ACCOUNT_TEMPLATE"]),
        url: Schema.String,
        created_at: Schema.String,
        updated_at: Schema.String,
        archived_at: Schema.optional(Schema.NullOr(Schema.String)),
        program_id: Schema.optional(Schema.NullOr(Schema.String)),
        name: Schema.String,
        deposit_account_type: Schema.Literals([
          "DDA",
          "FBO",
          "OMNIBUS",
          "VIRTUAL_DDA",
        ]),
        ownership_types: Schema.Array(
          Schema.Literals(["BUSINESS", "INDIVIDUAL"]),
        ),
        status: Schema.Literals(["ENABLED", "DISABLED"]),
        interest_rates: Schema.Struct({
          rate_config: Schema.Struct({
            rate_type: Schema.Literals(["FIXED", "VARIABLE"]),
            fixed_rate: Schema.optional(Schema.Unknown),
            variable_rate: Schema.optional(Schema.Unknown),
          }),
          starting_on: Schema.optional(Schema.NullOr(Schema.String)),
          ending_on: Schema.optional(Schema.NullOr(Schema.String)),
        }),
      }),
    ),
    has_more: Schema.Boolean,
    page_size: Schema.Number,
    page_next: Schema.optional(Schema.NullOr(Schema.String)),
    page_prev: Schema.optional(Schema.NullOr(Schema.String)),
    url: Schema.String,
  });
export type ListDepositAccountTemplatesOutput =
  typeof ListDepositAccountTemplatesOutput.Type;

// The operation
/**
 * List Deposit Account Templates
 *
 * Retrieve a paginated list of Deposit Account Templates
 *
 * @param page_size - Number of items per page (max 100)
 * @param starting_after - Cursor for pagination (exclusive start)
 * @param ending_before - Cursor for pagination (exclusive end)
 * @param deposit_account_type - Filter by deposit account type
 * @param ownership_type - Filter by ownership type
 * @param status - Filter by template status
 * @param program_id - Filter by program ID
 */
export const listDepositAccountTemplates = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: ListDepositAccountTemplatesInput,
    outputSchema: ListDepositAccountTemplatesOutput,
  }),
);
