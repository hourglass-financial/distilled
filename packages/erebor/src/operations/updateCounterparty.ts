import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const UpdateCounterpartyInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    name: Schema.optional(Schema.NullOr(Schema.String)),
    address: Schema.optional(Schema.Unknown),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(T.Http({ method: "PATCH", path: "/counterparties/{id}" }));
export type UpdateCounterpartyInput = typeof UpdateCounterpartyInput.Type;

// Output Schema
export const UpdateCounterpartyOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
    custom_ref: Schema.optional(Schema.Unknown),
    custom_fields: Schema.optional(Schema.Unknown),
  });
export type UpdateCounterpartyOutput = typeof UpdateCounterpartyOutput.Type;

// The operation
/**
 * Update Counterparty
 *
 * Update a counterparty's name and/or address.
 *
 * @param id - Counterparty ID
 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const updateCounterparty = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateCounterpartyInput,
  outputSchema: UpdateCounterpartyOutput,
  errors: [BadRequest, NotFound] as const,
}));
