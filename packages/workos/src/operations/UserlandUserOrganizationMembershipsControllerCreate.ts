import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound, UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface UserlandUserOrganizationMembershipsControllerCreateInput {
  user_id: string;
  organization_id: string;
  role_slug?: string;
  role_slugs?: ReadonlyArray<string>;
}
export const UserlandUserOrganizationMembershipsControllerCreateInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    user_id: Schema.String,
    organization_id: Schema.String,
    role_slug: Schema.optional(Schema.String),
    role_slugs: Schema.optional(Schema.Array(Schema.String)),
  }).pipe(
    T.Http({
      method: "POST",
      path: "/user_management/organization_memberships",
    }),
  ) as unknown as GeneratedStructCodec<UserlandUserOrganizationMembershipsControllerCreateInput>;

// Output Schema
export interface UserlandUserOrganizationMembershipsControllerCreateOutput {
  object: "organization_membership";
  id: string;
  user_id: string;
  organization_id: string;
  status: "active" | "inactive" | "pending";
  directory_managed: boolean;
  organization_name?: string;
  custom_attributes?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  role: { slug: string };
  roles: ReadonlyArray<{ slug: string }>;
  user: {
    object: "user";
    id: string;
    first_name: string | null;
    last_name: string | null;
    name?: string | null;
    profile_picture_url: string | null;
    email: string;
    email_verified: boolean;
    external_id: string | null;
    metadata?: Record<string, string>;
    last_sign_in_at: string | null;
    locale?: string | null;
    created_at: string;
    updated_at: string;
  };
}
export const UserlandUserOrganizationMembershipsControllerCreateOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["organization_membership"]),
    id: Schema.String,
    user_id: Schema.String,
    organization_id: Schema.String,
    status: Schema.Literals(["active", "inactive", "pending"]),
    directory_managed: Schema.Boolean,
    organization_name: Schema.optional(Schema.String),
    custom_attributes: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
    created_at: Schema.String,
    updated_at: Schema.String,
    role: Schema.Struct({
      slug: Schema.String,
    }),
    roles: Schema.Array(
      Schema.Struct({
        slug: Schema.String,
      }),
    ),
    user: Schema.Struct({
      object: Schema.Literals(["user"]),
      id: Schema.String,
      first_name: Schema.NullOr(Schema.String),
      last_name: Schema.NullOr(Schema.String),
      name: Schema.optional(Schema.NullOr(Schema.String)),
      profile_picture_url: Schema.NullOr(Schema.String),
      email: Schema.String,
      email_verified: Schema.Boolean,
      external_id: Schema.NullOr(Schema.String),
      metadata: Schema.optional(Schema.Record(Schema.String, Schema.String)),
      last_sign_in_at: Schema.NullOr(Schema.String),
      locale: Schema.optional(Schema.NullOr(Schema.String)),
      created_at: Schema.String,
      updated_at: Schema.String,
    }),
  }) as unknown as GeneratedStructCodec<UserlandUserOrganizationMembershipsControllerCreateOutput>;

// The operation
/**
 * Create an organization membership
 *
 * Creates a new `active` organization membership for the given organization and user.
 * Calling this API with an organization and user that match an `inactive` organization membership will activate the membership with the specified role(s).
 */
export const UserlandUserOrganizationMembershipsControllerCreate =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: UserlandUserOrganizationMembershipsControllerCreateInput,
    outputSchema: UserlandUserOrganizationMembershipsControllerCreateOutput,
    errors: [BadRequest, NotFound, UnprocessableEntity] as const,
  }));
