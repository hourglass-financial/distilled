import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const GetCounterpartyRailAddressInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(T.Http({ method: "GET", path: "/counterparty_rail_addresses/{id}" }));
export type GetCounterpartyRailAddressInput =
  typeof GetCounterpartyRailAddressInput.Type;

// Output Schema
export const GetCounterpartyRailAddressOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["COUNTERPARTY_RAIL_ADDRESS"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    customer_id: Schema.optional(Schema.NullOr(Schema.String)),
    program_id: Schema.optional(Schema.NullOr(Schema.String)),
    counterparty_id: Schema.optional(Schema.NullOr(Schema.String)),
    description: Schema.optional(Schema.String),
    address: Schema.String,
    custom_ref: Schema.optional(Schema.Unknown),
    custom_fields: Schema.optional(Schema.Unknown),
  });
export type GetCounterpartyRailAddressOutput =
  typeof GetCounterpartyRailAddressOutput.Type;

// The operation
/**
 * Retrieve Counterparty Rail Address
 *
 * Retrieve a specific Counterparty Rail Address by ID
 *
 * @param id - Rail address ID
 * @param Erebor-Version - Optional API version header. Use a date-based Erebor API version when you need to pin request behavior.
 */
export const getCounterpartyRailAddress = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: GetCounterpartyRailAddressInput,
    outputSchema: GetCounterpartyRailAddressOutput,
    errors: [BadRequest, NotFound] as const,
  }),
);
