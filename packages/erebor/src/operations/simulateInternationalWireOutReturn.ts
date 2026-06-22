import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound, Conflict } from "../errors.ts";

// Input Schema
export const SimulateInternationalWireOutReturnInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    ereborVersion: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Erebor-Version"),
    ),
  }).pipe(
    T.Http({
      method: "POST",
      path: "/simulation/international_wire_out/{id}/return",
    }),
  );
export type SimulateInternationalWireOutReturnInput =
  typeof SimulateInternationalWireOutReturnInput.Type;

// Output Schema
export const SimulateInternationalWireOutReturnOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    international_wire_out_id: Schema.String,
  });
export type SimulateInternationalWireOutReturnOutput =
  typeof SimulateInternationalWireOutReturnOutput.Type;

// The operation
/**
 * Simulate Outbound International Wire Transfer Return
 *
 * Force a settled outbound international wire transfer to `RETURNED` for testing. This endpoint is only available in the sandbox environment.
 * The transfer must be in `SETTLED` status when this endpoint is called; non-`SETTLED` transfers return `409 Conflict`.
 * The response returns immediately. The transfer is still `SETTLED` at response time; the flip to `RETURNED` is asynchronous — usually within a minute. Poll `GET /international_wire_out/{id}` or listen for the `INTERNATIONAL_WIRE_OUT.RETURNED` webhook to observe the transition.
 *
 * @param id - ID of the outbound international wire transfer to return. Must be in `SETTLED` status.
 * @param Erebor-Version - Optional API version header. Use a date-based Erebor API version when you need to pin request behavior.
 */
export const simulateInternationalWireOutReturn =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: SimulateInternationalWireOutReturnInput,
    outputSchema: SimulateInternationalWireOutReturnOutput,
    errors: [BadRequest, Forbidden, NotFound, Conflict] as const,
  }));
