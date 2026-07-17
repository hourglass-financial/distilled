import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface AuthorizationRolesControllerGetInput {
  slug: string;
}
export const AuthorizationRolesControllerGetInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    slug: Schema.String.pipe(T.PathParam()),
  }).pipe(
    T.Http({ method: "GET", path: "/authorization/roles/{slug}" }),
  ) as unknown as GeneratedStructCodec<AuthorizationRolesControllerGetInput>;

// Output Schema
export interface AuthorizationRolesControllerGetOutput {
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
export const AuthorizationRolesControllerGetOutput =
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
  }) as unknown as GeneratedStructCodec<AuthorizationRolesControllerGetOutput>;

// The operation
/**
 * Get an environment role
 *
 * Get an environment role by its slug.
 *
 * @param slug - The slug of the environment role.
 */
export const AuthorizationRolesControllerGet =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: AuthorizationRolesControllerGetInput,
    outputSchema: AuthorizationRolesControllerGetOutput,
    errors: [Forbidden, NotFound] as const,
  }));
