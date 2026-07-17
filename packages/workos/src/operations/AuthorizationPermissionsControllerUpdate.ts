import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { Forbidden, NotFound, UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface AuthorizationPermissionsControllerUpdateInput {
  slug: string;
  name?: string;
  description?: string | null;
}
export const AuthorizationPermissionsControllerUpdateInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    slug: Schema.String.pipe(T.PathParam()),
    name: Schema.optional(Schema.String),
    description: Schema.optional(Schema.NullOr(Schema.String)),
  }).pipe(
    T.Http({ method: "PATCH", path: "/authorization/permissions/{slug}" }),
  ) as unknown as GeneratedStructCodec<AuthorizationPermissionsControllerUpdateInput>;

// Output Schema
export interface AuthorizationPermissionsControllerUpdateOutput {
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
export const AuthorizationPermissionsControllerUpdateOutput =
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
  }) as unknown as GeneratedStructCodec<AuthorizationPermissionsControllerUpdateOutput>;

// The operation
/**
 * Update a permission
 *
 * Update an existing permission. Only the fields provided in the request body will be updated.
 *
 * @param slug - A unique key to reference the permission. Must be lowercase and contain only letters, numbers, hyphens, underscores, colons, periods, and asterisks.
 */
export const AuthorizationPermissionsControllerUpdate =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: AuthorizationPermissionsControllerUpdateInput,
    outputSchema: AuthorizationPermissionsControllerUpdateOutput,
    errors: [Forbidden, NotFound, UnprocessableEntity] as const,
  }));
