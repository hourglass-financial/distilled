import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { NotFound, UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface OrganizationApiKeysControllerCreateInput {
  organizationId: string;
  name: string;
  permissions?: ReadonlyArray<string>;
  expires_at?: string;
}
export const OrganizationApiKeysControllerCreateInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    organizationId: Schema.String.pipe(T.PathParam()),
    name: Schema.String,
    permissions: Schema.optional(Schema.Array(Schema.String)),
    expires_at: Schema.optional(Schema.String),
  }).pipe(
    T.Http({
      method: "POST",
      path: "/organizations/{organizationId}/api_keys",
    }),
  ) as unknown as GeneratedStructCodec<OrganizationApiKeysControllerCreateInput>;

// Output Schema
export interface OrganizationApiKeysControllerCreateOutput {
  object: "api_key";
  id: string;
  owner: { type: "organization"; id: string };
  name: string;
  obfuscated_value: string;
  last_used_at: string | null;
  expires_at: string | null;
  permissions: ReadonlyArray<string>;
  created_at: string;
  updated_at: string;
  value: string;
}
export const OrganizationApiKeysControllerCreateOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["api_key"]),
    id: Schema.String,
    owner: Schema.Struct({
      type: Schema.Literals(["organization"]),
      id: Schema.String,
    }),
    name: Schema.String,
    obfuscated_value: Schema.String,
    last_used_at: Schema.NullOr(Schema.String),
    expires_at: Schema.NullOr(Schema.String),
    permissions: Schema.Array(Schema.String),
    created_at: Schema.String,
    updated_at: Schema.String,
    value: Schema.String,
  }) as unknown as GeneratedStructCodec<OrganizationApiKeysControllerCreateOutput>;

// The operation
/**
 * Create an API key for an organization
 *
 * Create a new API key for an organization.
 *
 * @param organizationId - Unique identifier of the Organization.
 */
export const OrganizationApiKeysControllerCreate =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: OrganizationApiKeysControllerCreateInput,
    outputSchema: OrganizationApiKeysControllerCreateOutput,
    errors: [NotFound, UnprocessableEntity] as const,
  }));
