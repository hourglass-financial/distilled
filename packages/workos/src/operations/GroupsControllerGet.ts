import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface GroupsControllerGetInput {
  organizationId: string;
  groupId: string;
}
export const GroupsControllerGetInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    organizationId: Schema.String.pipe(T.PathParam()),
    groupId: Schema.String.pipe(T.PathParam()),
  }).pipe(
    T.Http({
      method: "GET",
      path: "/organizations/{organizationId}/groups/{groupId}",
    }),
  ) as unknown as GeneratedStructCodec<GroupsControllerGetInput>;

// Output Schema
export interface GroupsControllerGetOutput {
  object: "group";
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}
export const GroupsControllerGetOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["group"]),
    id: Schema.String,
    organization_id: Schema.String,
    name: Schema.String,
    description: Schema.NullOr(Schema.String),
    created_at: Schema.String,
    updated_at: Schema.String,
  }) as unknown as GeneratedStructCodec<GroupsControllerGetOutput>;

// The operation
/**
 * Get a group
 *
 * Retrieve a group by its ID within an organization.
 *
 * @param organizationId - The ID of the organization.
 * @param groupId - The ID of the group.
 */
export const GroupsControllerGet = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GroupsControllerGetInput,
  outputSchema: GroupsControllerGetOutput,
  errors: [Forbidden, NotFound] as const,
}));
