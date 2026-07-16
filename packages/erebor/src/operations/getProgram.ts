import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export interface GetProgramInput {
  id: string;
  ereborVersion?: string;
}
export const GetProgramInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String.pipe(T.PathParam()),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
}).pipe(
  T.Http({ method: "GET", path: "/programs/{id}" }),
) as unknown as Schema.Codec<GetProgramInput>;

// Output Schema
export interface GetProgramOutput {
  id: string;
  type: "PROGRAM";
  url: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  name: string;
  billing_deposit_account_id?: string;
  program_type?: string | null;
}
export const GetProgramOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String,
  type: Schema.Literals(["PROGRAM"]),
  url: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  archived_at: Schema.optional(Schema.NullOr(Schema.String)),
  name: Schema.String,
  billing_deposit_account_id: Schema.optional(Schema.String),
  program_type: Schema.optional(Schema.NullOr(Schema.String)),
}) as unknown as Schema.Codec<GetProgramOutput>;

// The operation
/**
 * Retrieve Program
 *
 * Retrieve a specific Program by ID
 *
 * @param id - Program ID
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const getProgram = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetProgramInput,
  outputSchema: GetProgramOutput,
  errors: [BadRequest, NotFound] as const,
}));
