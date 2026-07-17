import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface OrganizationsControllerDeleteOrganizationInput {
  id: string;
}
export const OrganizationsControllerDeleteOrganizationInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
  }).pipe(
    T.Http({ method: "DELETE", path: "/organizations/{id}" }),
  ) as unknown as GeneratedStructCodec<OrganizationsControllerDeleteOrganizationInput>;

// Output Schema
export type OrganizationsControllerDeleteOrganizationOutput = void;
export const OrganizationsControllerDeleteOrganizationOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Void as unknown as Schema.Codec<OrganizationsControllerDeleteOrganizationOutput>;

// The operation
/**
 * Delete an Organization
 *
 * Permanently deletes an organization in the current environment. It cannot be undone.
 *
 * @param id - Unique identifier of the Organization.
 */
export const OrganizationsControllerDeleteOrganization =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: OrganizationsControllerDeleteOrganizationInput,
    outputSchema: OrganizationsControllerDeleteOrganizationOutput,
    errors: [Forbidden, NotFound] as const,
  }));
