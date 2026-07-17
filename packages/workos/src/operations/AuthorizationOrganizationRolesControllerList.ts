import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface AuthorizationOrganizationRolesControllerListInput {
  organizationId: string;
}
export const AuthorizationOrganizationRolesControllerListInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    organizationId: Schema.String.pipe(T.PathParam()),
  }).pipe(
    T.Http({
      method: "GET",
      path: "/authorization/organizations/{organizationId}/roles",
    }),
  ) as unknown as GeneratedStructCodec<AuthorizationOrganizationRolesControllerListInput>;

// Output Schema
export interface AuthorizationOrganizationRolesControllerListOutput {
  object: "list";
  data: ReadonlyArray<{
    slug: string;
    object: "role";
    id: string;
    name: string;
    description: string | null;
    type: "EnvironmentRole" | "OrganizationRole";
    resource_type_slug: string;
    permissions: ReadonlyArray<string>;
    created_at: string;
    updated_at: string;
  }>;
}
export const AuthorizationOrganizationRolesControllerListOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["list"]),
    data: Schema.Array(
      Schema.Struct({
        slug: Schema.String,
        object: Schema.Literals(["role"]),
        id: Schema.String,
        name: Schema.String,
        description: Schema.NullOr(Schema.String),
        type: Schema.Literals(["EnvironmentRole", "OrganizationRole"]),
        resource_type_slug: Schema.String,
        permissions: Schema.Array(Schema.String),
        created_at: Schema.String,
        updated_at: Schema.String,
      }),
    ),
  }) as unknown as GeneratedStructCodec<AuthorizationOrganizationRolesControllerListOutput>;

// The operation
/**
 * List custom roles
 *
 * Get a list of all roles that apply to an organization. This includes both environment roles and custom roles, returned in priority order.
 *
 * @param organizationId - The ID of the organization.
 */
export const AuthorizationOrganizationRolesControllerList =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: AuthorizationOrganizationRolesControllerListInput,
    outputSchema: AuthorizationOrganizationRolesControllerListOutput,
    errors: [Forbidden, NotFound] as const,
  }));
