import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const GetDepositAccountTemplateInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(T.Http({ method: "GET", path: "/deposit_account_templates/{id}" }));
export type GetDepositAccountTemplateInput =
  typeof GetDepositAccountTemplateInput.Type;

// Output Schema
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
        fixed_rate: Schema.optional(Schema.Unknown),
        variable_rate: Schema.optional(Schema.Unknown),
      }),
      starting_on: Schema.optional(Schema.NullOr(Schema.String)),
      ending_on: Schema.optional(Schema.NullOr(Schema.String)),
    }),
  });
export type GetDepositAccountTemplateOutput =
  typeof GetDepositAccountTemplateOutput.Type;

// The operation
/**
 * Retrieve Deposit Account Template
 *
 * Retrieve a specific Deposit Account Template by ID
 *
 * @param id - Deposit account template ID
 * @param Erebor-Version - Optional API version header. Use a date-based Erebor API version when you need to pin request behavior.
 */
export const getDepositAccountTemplate = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: GetDepositAccountTemplateInput,
    outputSchema: GetDepositAccountTemplateOutput,
    errors: [BadRequest, NotFound] as const,
  }),
);
