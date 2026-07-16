import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface GetCounterpartyInput {
  id: string;
  ereborVersion?: string;
}
export const GetCounterpartyInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String.pipe(T.PathParam()),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
}).pipe(
  T.Http({ method: "GET", path: "/counterparties/{id}" }),
) as unknown as Schema.Codec<GetCounterpartyInput>;

// Output Schema
export interface GetCounterpartyOutput {
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
}
export const GetCounterpartyOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
}) as unknown as Schema.Codec<GetCounterpartyOutput>;

// The operation
/**
 * Retrieve Counterparty
 *
 * Retrieve a specific Counterparty by ID
 *
 * @param id - Counterparty ID
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getCounterparty = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetCounterpartyInput,
  outputSchema: GetCounterpartyOutput,
  errors: [BadRequest, NotFound] as const,
}));
