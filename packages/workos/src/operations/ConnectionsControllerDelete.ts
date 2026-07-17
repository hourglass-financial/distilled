import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface ConnectionsControllerDeleteInput {
  id: string;
}
export const ConnectionsControllerDeleteInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
  }).pipe(
    T.Http({ method: "DELETE", path: "/connections/{id}" }),
  ) as unknown as GeneratedStructCodec<ConnectionsControllerDeleteInput>;

// Output Schema
export type ConnectionsControllerDeleteOutput = void;
export const ConnectionsControllerDeleteOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Void as unknown as Schema.Codec<ConnectionsControllerDeleteOutput>;

// The operation
/**
 * Delete a Connection
 *
 * Permanently deletes an existing connection. It cannot be undone.
 *
 * @param id - Unique identifier for the Connection.
 */
export const ConnectionsControllerDelete = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: ConnectionsControllerDeleteInput,
    outputSchema: ConnectionsControllerDeleteOutput,
    errors: [Forbidden, NotFound] as const,
  }),
);
