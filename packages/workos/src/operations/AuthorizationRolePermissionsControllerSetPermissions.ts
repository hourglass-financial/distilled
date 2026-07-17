import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import {
  BadRequest,
  Forbidden,
  NotFound,
  UnprocessableEntity,
} from "../errors.ts";

// Input Schema
export interface AuthorizationRolePermissionsControllerSetPermissionsInput {
  slug: string;
  permissions: ReadonlyArray<string>;
}
export const AuthorizationRolePermissionsControllerSetPermissionsInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    slug: Schema.String.pipe(T.PathParam()),
    permissions: Schema.Array(Schema.String),
  }).pipe(
    T.Http({ method: "PUT", path: "/authorization/roles/{slug}/permissions" }),
  ) as unknown as GeneratedStructCodec<AuthorizationRolePermissionsControllerSetPermissionsInput>;

// Output Schema
export interface AuthorizationRolePermissionsControllerSetPermissionsOutput {
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
}
export const AuthorizationRolePermissionsControllerSetPermissionsOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
  }) as unknown as GeneratedStructCodec<AuthorizationRolePermissionsControllerSetPermissionsOutput>;

// The operation
/**
 * Set permissions for an environment role
 *
 * Replace all permissions on an environment role with the provided list.
 *
 * @param slug - The slug of the environment role.
 */
export const AuthorizationRolePermissionsControllerSetPermissions =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: AuthorizationRolePermissionsControllerSetPermissionsInput,
    outputSchema: AuthorizationRolePermissionsControllerSetPermissionsOutput,
    errors: [BadRequest, Forbidden, NotFound, UnprocessableEntity] as const,
  }));
