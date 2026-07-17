import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { Forbidden, NotFound, UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface AuthorizationResourcesControllerFindByIdInput {
  resource_id: string;
}
export const AuthorizationResourcesControllerFindByIdInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    resource_id: Schema.String.pipe(T.PathParam()),
  }).pipe(
    T.Http({ method: "GET", path: "/authorization/resources/{resource_id}" }),
  ) as unknown as GeneratedStructCodec<AuthorizationResourcesControllerFindByIdInput>;

// Output Schema
export interface AuthorizationResourcesControllerFindByIdOutput {
  object: "authorization_resource";
  name: string;
  description: string | null;
  organization_id: string;
  parent_resource_id: string | null;
  id: string;
  external_id: string;
  resource_type_slug: string;
  created_at: string;
  updated_at: string;
}
export const AuthorizationResourcesControllerFindByIdOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["authorization_resource"]),
    name: Schema.String,
    description: Schema.NullOr(Schema.String),
    organization_id: Schema.String,
    parent_resource_id: Schema.NullOr(Schema.String),
    id: Schema.String,
    external_id: Schema.String,
    resource_type_slug: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
  }) as unknown as GeneratedStructCodec<AuthorizationResourcesControllerFindByIdOutput>;

// The operation
/**
 * Get a resource
 *
 * Retrieve the details of an authorization resource by its ID.
 *
 * @param resource_id - The ID of the authorization resource.
 */
export const AuthorizationResourcesControllerFindById =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: AuthorizationResourcesControllerFindByIdInput,
    outputSchema: AuthorizationResourcesControllerFindByIdOutput,
    errors: [Forbidden, NotFound, UnprocessableEntity] as const,
  }));
