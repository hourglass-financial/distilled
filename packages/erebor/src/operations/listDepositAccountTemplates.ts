import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";

// Input Schema
export interface ListDepositAccountTemplatesInput {
  page_size?: number;
  starting_after?: string;
  ending_before?: string;
  deposit_account_type?: "DDA" | "FBO" | "OMNIBUS" | "VIRTUAL_DDA";
  ownership_type?: "BUSINESS" | "INDIVIDUAL";
  status?: "ENABLED" | "DISABLED";
  program_id?: string;
  ereborVersion?: string;
}
export const ListDepositAccountTemplatesInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    page_size: Schema.optional(Schema.Number),
    starting_after: Schema.optional(Schema.String),
    ending_before: Schema.optional(Schema.String),
    deposit_account_type: Schema.optional(
      Schema.Literals(["DDA", "FBO", "OMNIBUS", "VIRTUAL_DDA"]),
    ),
    ownership_type: Schema.optional(
      Schema.Literals(["BUSINESS", "INDIVIDUAL"]),
    ),
    status: Schema.optional(Schema.Literals(["ENABLED", "DISABLED"])),
    program_id: Schema.optional(Schema.String),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/deposit_account_templates" }),
  ) as unknown as Schema.Codec<ListDepositAccountTemplatesInput>;

// Output Schema
export interface ListDepositAccountTemplatesOutput {
  data: ReadonlyArray<{
    id: string;
    type: "DEPOSIT_ACCOUNT_TEMPLATE";
    url: string;
    created_at: string;
    updated_at: string;
    archived_at?: string | null;
    program_id?: string | null;
    name: string;
    deposit_account_type: "DDA" | "FBO" | "OMNIBUS" | "VIRTUAL_DDA";
    ownership_types: ReadonlyArray<"BUSINESS" | "INDIVIDUAL">;
    status: "ENABLED" | "DISABLED";
    interest_rates: {
      rate_config: {
        rate_type: "FIXED" | "VARIABLE";
        fixed_rate?: {
          tiers: ReadonlyArray<{
            balance_min: {
              currency: string;
              exponent?: number;
              value: string;
              display_value?: string;
            };
            balance_max?: unknown;
            rate_bps: number;
          }>;
        } | null;
        variable_rate?: {
          benchmark: "EFFR";
          tiers: ReadonlyArray<{
            balance_min: {
              currency: string;
              exponent?: number;
              value: string;
              display_value?: string;
            };
            balance_max?: unknown;
            calculation_method: "SPREAD" | "PERCENTAGE";
            spread_bps?: number | null;
            percentage_bps?: number | null;
          }>;
        } | null;
      };
      starting_on?: string | null;
      ending_on?: string | null;
    };
  }>;
  has_more: boolean;
  page_size: number;
  page_next?: string | null;
  page_prev?: string | null;
  url: string;
}
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
            fixed_rate: Schema.optional(
              Schema.NullOr(
                Schema.Struct({
                  tiers: Schema.Array(
                    Schema.Struct({
                      balance_min: Schema.Struct({
                        currency: Schema.String,
                        exponent: Schema.optional(Schema.Number),
                        value: Schema.String,
                        display_value: Schema.optional(Schema.String),
                      }),
                      balance_max: Schema.optional(Schema.Unknown),
                      rate_bps: Schema.Number,
                    }),
                  ),
                }),
              ),
            ),
            variable_rate: Schema.optional(
              Schema.NullOr(
                Schema.Struct({
                  benchmark: Schema.Literals(["EFFR"]),
                  tiers: Schema.Array(
                    Schema.Struct({
                      balance_min: Schema.Struct({
                        currency: Schema.String,
                        exponent: Schema.optional(Schema.Number),
                        value: Schema.String,
                        display_value: Schema.optional(Schema.String),
                      }),
                      balance_max: Schema.optional(Schema.Unknown),
                      calculation_method: Schema.Literals([
                        "SPREAD",
                        "PERCENTAGE",
                      ]),
                      spread_bps: Schema.optional(Schema.NullOr(Schema.Number)),
                      percentage_bps: Schema.optional(
                        Schema.NullOr(Schema.Number),
                      ),
                    }),
                  ),
                }),
              ),
            ),
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
  }) as unknown as Schema.Codec<ListDepositAccountTemplatesOutput>;

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
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const listDepositAccountTemplates = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: ListDepositAccountTemplatesInput,
    outputSchema: ListDepositAccountTemplatesOutput,
  }),
);
