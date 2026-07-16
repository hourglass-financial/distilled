import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface GetCounterpartyRailAddressInput {
  id: string;
  ereborVersion?: string;
}
export const GetCounterpartyRailAddressInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/counterparty_rail_addresses/{id}" }),
  ) as unknown as Schema.Codec<GetCounterpartyRailAddressInput>;

// Output Schema
export interface GetCounterpartyRailAddressOutput {
  id: string;
  type: "COUNTERPARTY_RAIL_ADDRESS";
  url: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  customer_id?: string | null;
  program_id?: string | null;
  counterparty_id?: string | null;
  description?: string | null;
  address: string;
  custom_ref?: string | null;
  custom_fields?: Record<string, unknown> | null;
}
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
    description: Schema.optional(Schema.NullOr(Schema.String)),
    address: Schema.String,
    custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
    custom_fields: Schema.optional(
      Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
    ),
  }) as unknown as Schema.Codec<GetCounterpartyRailAddressOutput>;

// The operation
/**
 * Retrieve Counterparty Rail Address
 *
 * Retrieve a specific Counterparty Rail Address by ID
 *
 * @param id - Rail address ID
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getCounterpartyRailAddress = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: GetCounterpartyRailAddressInput,
    outputSchema: GetCounterpartyRailAddressOutput,
    errors: [BadRequest, NotFound] as const,
  }),
);
