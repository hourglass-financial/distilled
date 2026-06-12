import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound, Conflict } from "../errors.ts";

// Input Schema
export const SimulateWireOutReturnInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
  }).pipe(T.Http({ method: "POST", path: "/simulation/wire_out/{id}/return" }));
export type SimulateWireOutReturnInput = typeof SimulateWireOutReturnInput.Type;

// Output Schema
export const SimulateWireOutReturnOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String,
  });
export type SimulateWireOutReturnOutput =
  typeof SimulateWireOutReturnOutput.Type;

// The operation
/**
 * Simulate Outbound Wire Transfer Return
 *
 * Force a settled outbound wire transfer to `RETURNED` for testing. This endpoint is only available in the sandbox environment.
 * The transfer must be in `SETTLED` status when this endpoint is called; non-`SETTLED` transfers return `409 Conflict`.
 * The response returns immediately. The transfer is still `SETTLED` at response time; the flip to `RETURNED` is asynchronous — usually within a minute. Poll `GET /wire_out/{id}` or listen for the `WIRE_OUT.RETURNED` webhook to observe the transition.
 *
 * @param id - ID of the outbound wire transfer to return. Must be in `SETTLED` status.
 */
export const simulateWireOutReturn = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: SimulateWireOutReturnInput,
    outputSchema: SimulateWireOutReturnOutput,
    errors: [BadRequest, Forbidden, NotFound, Conflict] as const,
  }),
);
