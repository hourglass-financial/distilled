import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { Forbidden } from "../errors.ts";

// Input Schema
export interface AuthorizationRolesControllerListInput {}
export const AuthorizationRolesControllerListInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({}).pipe(
    T.Http({ method: "GET", path: "/authorization/roles" }),
  ) as unknown as GeneratedStructCodec<AuthorizationRolesControllerListInput>;

// Output Schema
export interface AuthorizationRolesControllerListOutput {
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
export const AuthorizationRolesControllerListOutput =
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
  }) as unknown as GeneratedStructCodec<AuthorizationRolesControllerListOutput>;

// The operation
/**
 * List environment roles
 *
 * List all environment roles in priority order.
 */
export const AuthorizationRolesControllerList =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: AuthorizationRolesControllerListInput,
    outputSchema: AuthorizationRolesControllerListOutput,
    errors: [Forbidden] as const,
  }));
