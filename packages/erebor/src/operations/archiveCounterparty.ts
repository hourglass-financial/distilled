import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound, Conflict } from "../errors.ts";

// Input Schema
export interface ArchiveCounterpartyInput {
  id: string;
  ereborVersion?: string;
  ereborIdempotencyKey?: string;
}
export const ArchiveCounterpartyInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
    ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Idempotency-Key"),
    ),
  }).pipe(
    T.Http({ method: "POST", path: "/counterparties/{id}/archive" }),
  ) as unknown as GeneratedStructCodec<ArchiveCounterpartyInput>;

// Output Schema
export interface ArchiveCounterpartyOutput {
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
    custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
    custom_fields: Schema.optional(
      Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
    ),
  }) as unknown as GeneratedStructCodec<ArchiveCounterpartyOutput>;

// The operation
/**
 * Archive Counterparty
 *
 * Soft-deletes a Counterparty by setting `archived_at`. In the same transaction, the Counterparty's linked address book entries are archived, and its saved bank accounts and addresses are unlinked rather than deleted: they remain retrievable by ID, but their `counterparty_id` becomes `null` and they no longer match `counterparty_id` list filters. Archiving a Counterparty that is already archived returns `404`. Emits a `COUNTERPARTY.ARCHIVED` event.
 *
 * @param id - Counterparty ID
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param ereborIdempotencyKey - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const archiveCounterparty = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ArchiveCounterpartyInput,
  outputSchema: ArchiveCounterpartyOutput,
  errors: [BadRequest, NotFound, Conflict] as const,
}));
