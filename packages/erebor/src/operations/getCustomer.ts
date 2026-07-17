import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface GetCustomerInput {
  id: string;
  ereborVersion?: string;
}
export const GetCustomerInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String.pipe(T.PathParam()),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
}).pipe(
  T.Http({ method: "GET", path: "/customers/{id}" }),
) as unknown as GeneratedStructCodec<GetCustomerInput>;

// Output Schema
export interface GetCustomerOutput {
  id: string;
  type: "CUSTOMER";
  url: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  program_id?: string | null;
  status: "ACTIVE" | "OFFBOARDED";
  name: string;
  onboarding_id?: string | null;
  custom_ref?: string | null;
  custom_fields?: Record<string, unknown> | null;
}
export const GetCustomerOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String,
  type: Schema.Literals(["CUSTOMER"]),
  url: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  archived_at: Schema.optional(Schema.NullOr(Schema.String)),
  program_id: Schema.optional(Schema.NullOr(Schema.String)),
  status: Schema.Literals(["ACTIVE", "OFFBOARDED"]),
  name: Schema.String,
  onboarding_id: Schema.optional(Schema.NullOr(Schema.String)),
  custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
  custom_fields: Schema.optional(
    Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
  ),
}) as unknown as GeneratedStructCodec<GetCustomerOutput>;

// The operation
/**
 * Retrieve Customer
 *
 * Retrieve a specific Customer by ID
 *
 * @param id - Customer ID
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getCustomer = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetCustomerInput,
  outputSchema: GetCustomerOutput,
  errors: [BadRequest, NotFound] as const,
}));
