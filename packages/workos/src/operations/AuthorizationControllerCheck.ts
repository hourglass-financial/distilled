import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { Forbidden, NotFound, UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface AuthorizationControllerCheckInput {
  organization_membership_id: string;
  permission_slug: string;
  resource_id?: string;
  resource_external_id?: string;
  resource_type_slug?: string;
}
export const AuthorizationControllerCheckInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    organization_membership_id: Schema.String.pipe(T.PathParam()),
    permission_slug: Schema.String,
    resource_id: Schema.optional(Schema.String),
    resource_external_id: Schema.optional(Schema.String),
    resource_type_slug: Schema.optional(Schema.String),
  }).pipe(
    T.Http({
      method: "POST",
      path: "/authorization/organization_memberships/{organization_membership_id}/check",
    }),
  ) as unknown as GeneratedStructCodec<AuthorizationControllerCheckInput>;

// Output Schema
export interface AuthorizationControllerCheckOutput {
  authorized: boolean;
}
export const AuthorizationControllerCheckOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    authorized: Schema.Boolean,
  }) as unknown as GeneratedStructCodec<AuthorizationControllerCheckOutput>;

// The operation
/**
 * Check authorization
 *
 * Check if an organization membership has a specific permission on a resource. Supports identification by resource_id OR by resource_external_id + resource_type_slug.
 *
 * @param organization_membership_id - The ID of the organization membership to check.
 */
export const AuthorizationControllerCheck =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: AuthorizationControllerCheckInput,
    outputSchema: AuthorizationControllerCheckOutput,
    errors: [Forbidden, NotFound, UnprocessableEntity] as const,
  }));
