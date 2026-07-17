import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { NotFound } from "../errors.ts";

// Input Schema
export interface ApplicationCredentialsControllerDeleteInput {
  id: string;
}
export const ApplicationCredentialsControllerDeleteInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
  }).pipe(
    T.Http({ method: "DELETE", path: "/connect/client_secrets/{id}" }),
  ) as unknown as GeneratedStructCodec<ApplicationCredentialsControllerDeleteInput>;

// Output Schema
export type ApplicationCredentialsControllerDeleteOutput = void;
export const ApplicationCredentialsControllerDeleteOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Void as unknown as Schema.Codec<ApplicationCredentialsControllerDeleteOutput>;

// The operation
/**
 * Delete a Client Secret
 *
 * Delete (revoke) an existing client secret.
 *
 * @param id - The unique ID of the client secret.
 */
export const ApplicationCredentialsControllerDelete =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: ApplicationCredentialsControllerDeleteInput,
    outputSchema: ApplicationCredentialsControllerDeleteOutput,
    errors: [NotFound] as const,
  }));
