import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound, Conflict } from "../errors.ts";

// Input Schema
export interface UpdateBlockchainAddressInput {
  id: string;
  ereborVersion?: string;
  ereborIdempotencyKey?: string;
  name?: string | null;
  custom_ref?: string;
  custom_fields?: Record<string, unknown>;
}
export const UpdateBlockchainAddressInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
    ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Idempotency-Key"),
    ),
    name: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(
    T.Http({ method: "PATCH", path: "/blockchain_addresses/{id}" }),
  ) as unknown as GeneratedStructCodec<UpdateBlockchainAddressInput>;

// Output Schema
export interface UpdateBlockchainAddressOutput {
  id: string;
  type: "BLOCKCHAIN_ADDRESS";
  url: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  deposit_account_id: string;
  name?: string | null;
  address: string;
  address_type: "ETHEREUM" | "SOLANA" | "SUI";
  network: ReadonlyArray<"BASE" | "ETHEREUM" | "INK" | "SOLANA" | "SUI">;
  custom_ref?: string | null;
  custom_fields?: Record<string, unknown> | null;
}
export const UpdateBlockchainAddressOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    type: Schema.Literals(["BLOCKCHAIN_ADDRESS"]),
    url: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    archived_at: Schema.optional(Schema.NullOr(Schema.String)),
    deposit_account_id: Schema.String,
    name: Schema.optional(Schema.NullOr(Schema.String)),
    address: Schema.String,
    address_type: Schema.Literals(["ETHEREUM", "SOLANA", "SUI"]),
    network: Schema.Array(
      Schema.Literals(["BASE", "ETHEREUM", "INK", "SOLANA", "SUI"]),
    ),
    custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
    custom_fields: Schema.optional(
      Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
    ),
  }) as unknown as GeneratedStructCodec<UpdateBlockchainAddressOutput>;

// The operation
/**
 * Update Blockchain Address
 *
 * Update a blockchain address's `custom_ref` or `custom_fields`. Renaming is not yet available — requests that include `name` return a `429 RATE_LIMITED` error and no changes are applied. The on-chain address, address type, and network set are immutable.
 *
 * @param id - Blockchain address ID
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param ereborIdempotencyKey - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const updateBlockchainAddress = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: UpdateBlockchainAddressInput,
    outputSchema: UpdateBlockchainAddressOutput,
    errors: [BadRequest, NotFound, Conflict] as const,
  }),
);
