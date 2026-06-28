import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound, Conflict } from "../errors.ts";

// Input Schema
export const ArchiveCounterpartyInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
    ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Idempotency-Key"),
    ),
  }).pipe(T.Http({ method: "POST", path: "/counterparties/{id}/archive" }));
export type ArchiveCounterpartyInput = typeof ArchiveCounterpartyInput.Type;

// Output Schema
export const ArchiveCounterpartyOutput =
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
export type ArchiveCounterpartyOutput = typeof ArchiveCounterpartyOutput.Type;

// The operation
/**
 * Archive Counterparty
 *
 * Soft-deletes a Counterparty by setting `archived_at`. In the same transaction, the Counterparty's linked address book entries are archived, and its saved bank accounts and addresses are unlinked rather than deleted: they remain retrievable by ID, but their `counterparty_id` becomes `null` and they no longer match `counterparty_id` list filters. Archiving a Counterparty that is already archived returns `404`. Emits a `COUNTERPARTY.ARCHIVED` event.
 *
 * @param id - Counterparty ID
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param Erebor-Idempotency-Key - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const archiveCounterparty = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ArchiveCounterpartyInput,
  outputSchema: ArchiveCounterpartyOutput,
  errors: [BadRequest, NotFound, Conflict] as const,
}));
