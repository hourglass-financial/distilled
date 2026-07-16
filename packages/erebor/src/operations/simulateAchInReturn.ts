import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound, Conflict } from "../errors.ts";

// Input Schema
export interface SimulateAchInReturnInput {
  id: string;
  return_code?: string;
  ereborVersion?: string;
}
export const SimulateAchInReturnInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    return_code: Schema.optional(Schema.String),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({ method: "POST", path: "/simulation/ach_in/{id}/return" }),
  ) as unknown as Schema.Codec<SimulateAchInReturnInput>;

// Output Schema
export interface SimulateAchInReturnOutput {
  id: string;
  return_code: string;
}
export const SimulateAchInReturnOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
    return_code: Schema.String,
  }) as unknown as Schema.Codec<SimulateAchInReturnOutput>;

// The operation
/**
 * Simulate Inbound ACH Transfer Return
 *
 * Force a settled inbound ACH transfer to `RETURNED` for testing. This endpoint is only available in the sandbox environment.
 * The transfer must be in `SETTLED` status when this endpoint is called; non-`SETTLED` transfers return `409 Conflict`.
 * The endpoint returns immediately before the status flips — the transfer is still `SETTLED` at this point. The flip to `RETURNED` is asynchronous, usually within a minute. Poll `GET /ach_in/{id}` or listen for the `ACH_IN.RETURNED` webhook to observe the transition.
 * Pass an optional `return_code` query parameter to control the return reason code; defaults to `R01` (Insufficient Funds).
 *
 * @param id - ID of the inbound ACH transfer to return. Must be in `SETTLED` status.
 * @param return_code - NACHA return reason code to apply to the returned transfer. Defaults to `R01` (Insufficient Funds) when omitted. Must be a NACHA return reason code matching `^R[0-9]{2}$` (R01-R85). Codes that match the pattern but are not in the NACHA set return `400`.

 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const simulateAchInReturn = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: SimulateAchInReturnInput,
  outputSchema: SimulateAchInReturnOutput,
  errors: [BadRequest, Forbidden, NotFound, Conflict] as const,
}));
