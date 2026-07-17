import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, NotFound, UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface UserlandUserOrganizationMembershipsControllerDeactivateInput {
  id: string;
}
export const UserlandUserOrganizationMembershipsControllerDeactivateInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
  }).pipe(
    T.Http({
      method: "PUT",
      path: "/user_management/organization_memberships/{id}/deactivate",
    }),
  ) as unknown as GeneratedStructCodec<UserlandUserOrganizationMembershipsControllerDeactivateInput>;

// Output Schema
export interface UserlandUserOrganizationMembershipsControllerDeactivateOutput {
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
export const UserlandUserOrganizationMembershipsControllerDeactivateOutput =
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
  }) as unknown as GeneratedStructCodec<UserlandUserOrganizationMembershipsControllerDeactivateOutput>;

// The operation
/**
 * Deactivate an organization membership
 *
 * Deactivates an `active` organization membership. Emits an [organization_membership.updated](/events/organization-membership) event upon successful deactivation.
 * - Deactivating an `inactive` membership is a no-op and does not emit an event.
 * - Deactivating a `pending` membership returns an error. This membership should be [deleted](/reference/authkit/organization-membership/delete) instead.
 * See the [membership management documentation](/authkit/users-organizations/organizations/membership-management) for additional details.
 *
 * @param id - The unique ID of the organization membership.
 */
export const UserlandUserOrganizationMembershipsControllerDeactivate =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: UserlandUserOrganizationMembershipsControllerDeactivateInput,
    outputSchema: UserlandUserOrganizationMembershipsControllerDeactivateOutput,
    errors: [BadRequest, NotFound, UnprocessableEntity] as const,
  }));
