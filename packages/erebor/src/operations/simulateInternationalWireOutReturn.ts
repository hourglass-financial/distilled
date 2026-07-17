import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, Forbidden, NotFound, Conflict } from "../errors.ts";

// Input Schema
export interface SimulateInternationalWireOutReturnInput {
  id: string;
  ereborVersion?: string;
}
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
  ) as unknown as GeneratedStructCodec<SimulateInternationalWireOutReturnInput>;

// Output Schema
export interface SimulateInternationalWireOutReturnOutput {
  international_wire_out_id: string;
}
export const SimulateInternationalWireOutReturnOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    international_wire_out_id: Schema.String,
  }) as unknown as GeneratedStructCodec<SimulateInternationalWireOutReturnOutput>;

// The operation
/**
 * Simulate Outbound International Wire Transfer Return
 *
 * Force a settled outbound international wire transfer to `RETURNED` for testing. This endpoint is only available in the sandbox environment.
 * The transfer must be in `SETTLED` status when this endpoint is called; non-`SETTLED` transfers return `409 Conflict`.
 * The response returns immediately. The transfer is still `SETTLED` at response time; the flip to `RETURNED` is asynchronous — usually within a minute. Poll `GET /international_wire_out/{id}` or listen for the `INTERNATIONAL_WIRE_OUT.RETURNED` webhook to observe the transition.
 *
 * @param id - ID of the outbound international wire transfer to return. Must be in `SETTLED` status.
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const simulateInternationalWireOutReturn =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: SimulateInternationalWireOutReturnInput,
    outputSchema: SimulateInternationalWireOutReturnOutput,
    errors: [BadRequest, Forbidden, NotFound, Conflict] as const,
  }));
