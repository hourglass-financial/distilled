import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import {
  BadRequest,
  Conflict,
  UnprocessableEntity,
  EreborValidationError,
} from "../errors.ts";

// Input Schema
export interface CreateBlockchainAddressInput {
  ereborVersion?: string;
  ereborIdempotencyKey?: string;
  deposit_account_id: string;
  address_type: "ETHEREUM" | "SOLANA" | "SUI";
  name?: string | null;
  custom_ref?: string;
  custom_fields?: Record<string, unknown>;
}
export const CreateBlockchainAddressInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
    ereborIdempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Idempotency-Key"),
    ),
    deposit_account_id: Schema.String,
    address_type: Schema.Literals(["ETHEREUM", "SOLANA", "SUI"]),
    name: Schema.optional(Schema.NullOr(Schema.String)),
    custom_ref: Schema.optional(Schema.String),
    custom_fields: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
  }).pipe(
    T.Http({ method: "POST", path: "/blockchain_addresses" }),
  ) as unknown as GeneratedStructCodec<CreateBlockchainAddressInput>;

// Output Schema
export interface CreateBlockchainAddressOutput {
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
export const CreateBlockchainAddressOutput =
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
  }) as unknown as GeneratedStructCodec<CreateBlockchainAddressOutput>;

// The operation
/**
 * Create Blockchain Address
 *
 * Create a new Blockchain Address for a Deposit Account
 *
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 * @param ereborIdempotencyKey - Optional idempotency key to safely retry requests. If provided, multiple requests with the same key will only perform the action once and return the same result (even if the result was an error).

 */
export const createBlockchainAddress = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: CreateBlockchainAddressInput,
    outputSchema: CreateBlockchainAddressOutput,
    errors: [
      BadRequest,
      Conflict,
      UnprocessableEntity,
      EreborValidationError,
    ] as const,
  }),
);
