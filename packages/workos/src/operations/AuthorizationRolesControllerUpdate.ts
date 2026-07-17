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
export interface AuthorizationRolesControllerUpdateInput {
  slug: string;
  name?: string;
  description?: string | null;
}
export const AuthorizationRolesControllerUpdateInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    slug: Schema.String.pipe(T.PathParam()),
    name: Schema.optional(Schema.String),
    description: Schema.optional(Schema.NullOr(Schema.String)),
  }).pipe(
    T.Http({ method: "PATCH", path: "/authorization/roles/{slug}" }),
  ) as unknown as GeneratedStructCodec<AuthorizationRolesControllerUpdateInput>;

// Output Schema
export interface AuthorizationRolesControllerUpdateOutput {
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
export const AuthorizationRolesControllerUpdateOutput =
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
  }) as unknown as GeneratedStructCodec<AuthorizationRolesControllerUpdateOutput>;

// The operation
/**
 * Update an environment role
 *
 * Update an existing environment role.
 *
 * @param slug - The slug of the environment role.
 */
export const AuthorizationRolesControllerUpdate =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: AuthorizationRolesControllerUpdateInput,
    outputSchema: AuthorizationRolesControllerUpdateOutput,
    errors: [BadRequest, Forbidden, NotFound, UnprocessableEntity] as const,
  }));
