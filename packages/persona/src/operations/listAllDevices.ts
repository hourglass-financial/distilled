import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden } from "../errors.ts";

// Input Schema
export const ListAllDevicesInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  filter: Schema.Struct({
    "inquiry-session-id": Schema.String,
  }).pipe(T.HttpQuery("filter")),
  keyInflection: Schema.optional(
    Schema.Literals(["camel", "kebab", "snake"]),
  ).pipe(T.HttpHeader("Key-Inflection")),
  idempotencyKey: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Idempotency-Key"),
  ),
  personaVersion: Schema.optional(
    Schema.Literals([
      "2025-12-08",
      "2025-10-27",
      "2023-01-05",
      "2022-09-01",
      "2021-08-18",
      "2021-07-05",
      "2021-02-21",
      "2020-05-18",
    ]),
  ).pipe(T.HttpHeader("Persona-Version")),
}).pipe(T.Http({ method: "GET", path: "/devices" }));
export type ListAllDevicesInput = typeof ListAllDevicesInput.Type;

// Output Schema
export const ListAllDevicesOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
      type: Schema.optional(Schema.String),
      id: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          "device-vendor-id": Schema.optional(Schema.NullOr(Schema.String)),
          "device-fingerprint": Schema.optional(Schema.NullOr(Schema.String)),
          "browser-fingerprint": Schema.optional(Schema.NullOr(Schema.String)),
        }),
      ),
    }),
  ),
  links: Schema.Struct({
    prev: Schema.NullOr(Schema.String),
    next: Schema.NullOr(Schema.String),
  }),
});
export type ListAllDevicesOutput = typeof ListAllDevicesOutput.Type;

// The operation
/**
 * List all Devices
 *
 * Retrieves a list of Devices. Results are returned in reverse chronological order, with the most recently created objects first.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 */
export const listAllDevices = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListAllDevicesInput,
  outputSchema: ListAllDevicesOutput,
  errors: [BadRequest, Forbidden] as const,
}));
