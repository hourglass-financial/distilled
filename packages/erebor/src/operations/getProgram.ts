import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";

// Input Schema
export const GetProgramInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String.pipe(T.PathParam()),
}).pipe(T.Http({ method: "GET", path: "/programs/{id}" }));
export type GetProgramInput = typeof GetProgramInput.Type;

// Output Schema
export const GetProgramOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String,
  type: Schema.Literals(["PROGRAM"]),
  url: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  archived_at: Schema.optional(Schema.NullOr(Schema.String)),
  name: Schema.String,
  billing_deposit_account_id: Schema.String,
});
export type GetProgramOutput = typeof GetProgramOutput.Type;

// The operation
/**
 * Retrieve Program
 *
 * Retrieve a specific Program by ID
 *
 * @param id - Program ID
 */
export const getProgram = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetProgramInput,
  outputSchema: GetProgramOutput,
  errors: [BadRequest, NotFound] as const,
}));
