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
export interface GroupMembershipsControllerAddMemberInput {
  organizationId: string;
  groupId: string;
  organization_membership_id: string;
}
export const GroupMembershipsControllerAddMemberInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    organizationId: Schema.String.pipe(T.PathParam()),
    groupId: Schema.String.pipe(T.PathParam()),
    organization_membership_id: Schema.String,
  }).pipe(
    T.Http({
      method: "POST",
      path: "/organizations/{organizationId}/groups/{groupId}/organization-memberships",
    }),
  ) as unknown as GeneratedStructCodec<GroupMembershipsControllerAddMemberInput>;

// Output Schema
export interface GroupMembershipsControllerAddMemberOutput {
  object: "group";
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}
export const GroupMembershipsControllerAddMemberOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["group"]),
    id: Schema.String,
    organization_id: Schema.String,
    name: Schema.String,
    description: Schema.NullOr(Schema.String),
    created_at: Schema.String,
    updated_at: Schema.String,
  }) as unknown as GeneratedStructCodec<GroupMembershipsControllerAddMemberOutput>;

// The operation
/**
 * Add a member to a Group
 *
 * Add an organization membership to a group.
 *
 * @param organizationId - Unique identifier of the Organization.
 * @param groupId - Unique identifier of the Group.
 */
export const GroupMembershipsControllerAddMember =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: GroupMembershipsControllerAddMemberInput,
    outputSchema: GroupMembershipsControllerAddMemberOutput,
    errors: [BadRequest, Forbidden, NotFound, UnprocessableEntity] as const,
  }));
