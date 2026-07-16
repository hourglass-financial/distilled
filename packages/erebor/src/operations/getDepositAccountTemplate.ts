import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface GetDepositAccountTemplateInput {
  id: string;
  ereborVersion?: string;
}
export const GetDepositAccountTemplateInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/deposit_account_templates/{id}" }),
  ) as unknown as Schema.Codec<GetDepositAccountTemplateInput>;

// Output Schema
export interface GetDepositAccountTemplateOutput {
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
          balance_max?: {
            currency: string;
            exponent?: number;
            value: string;
            display_value?: string;
          } | null;
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
          balance_max?: {
            currency: string;
            exponent?: number;
            value: string;
            display_value?: string;
          } | null;
          calculation_method: "SPREAD" | "PERCENTAGE";
          spread_bps?: number | null;
          percentage_bps?: number | null;
        }>;
      } | null;
    };
    starting_on?: string | null;
    ending_on?: string | null;
  };
}
export const GetDepositAccountTemplateOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
    ownership_types: Schema.Array(Schema.Literals(["BUSINESS", "INDIVIDUAL"])),
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
                  balance_max: Schema.optional(
                    Schema.NullOr(
                      Schema.Struct({
                        currency: Schema.String,
                        exponent: Schema.optional(Schema.Number),
                        value: Schema.String,
                        display_value: Schema.optional(Schema.String),
                      }),
                    ),
                  ),
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
                  balance_max: Schema.optional(
                    Schema.NullOr(
                      Schema.Struct({
                        currency: Schema.String,
                        exponent: Schema.optional(Schema.Number),
                        value: Schema.String,
                        display_value: Schema.optional(Schema.String),
                      }),
                    ),
                  ),
                  calculation_method: Schema.Literals(["SPREAD", "PERCENTAGE"]),
                  spread_bps: Schema.optional(Schema.NullOr(Schema.Number)),
                  percentage_bps: Schema.optional(Schema.NullOr(Schema.Number)),
                }),
              ),
            }),
          ),
        ),
      }),
      starting_on: Schema.optional(Schema.NullOr(Schema.String)),
      ending_on: Schema.optional(Schema.NullOr(Schema.String)),
    }),
  }) as unknown as Schema.Codec<GetDepositAccountTemplateOutput>;

// The operation
/**
 * Retrieve Deposit Account Template
 *
 * Retrieve a specific Deposit Account Template by ID
 *
 * @param id - Deposit account template ID
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getDepositAccountTemplate = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: GetDepositAccountTemplateInput,
    outputSchema: GetDepositAccountTemplateOutput,
    errors: [BadRequest, NotFound] as const,
  }),
);
