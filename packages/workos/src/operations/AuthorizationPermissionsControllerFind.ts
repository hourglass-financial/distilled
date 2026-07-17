import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { NotFound } from "../errors.ts";

// Input Schema
export interface AuthorizationPermissionsControllerFindInput {
  slug: string;
}
export const AuthorizationPermissionsControllerFindInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    slug: Schema.String.pipe(T.PathParam()),
  }).pipe(
    T.Http({ method: "GET", path: "/authorization/permissions/{slug}" }),
  ) as unknown as GeneratedStructCodec<AuthorizationPermissionsControllerFindInput>;

// Output Schema
export interface AuthorizationPermissionsControllerFindOutput {
  object: "permission";
  id: string;
  slug: string;
  name: string;
  description: string | null;
  system: boolean;
  resource_type_slug: string;
  created_at: string;
  updated_at: string;
}
export const AuthorizationPermissionsControllerFindOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["permission"]),
    id: Schema.String,
    slug: Schema.String,
    name: Schema.String,
    description: Schema.NullOr(Schema.String),
    system: Schema.Boolean,
    resource_type_slug: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
  }) as unknown as GeneratedStructCodec<AuthorizationPermissionsControllerFindOutput>;

// The operation
/**
 * Get a permission
 *
 * Retrieve a permission by its unique slug.
 *
 * @param slug - A unique key to reference the permission. Must be lowercase and contain only letters, numbers, hyphens, underscores, colons, periods, and asterisks.
 */
export const AuthorizationPermissionsControllerFind =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: AuthorizationPermissionsControllerFindInput,
    outputSchema: AuthorizationPermissionsControllerFindOutput,
    errors: [NotFound] as const,
  }));
