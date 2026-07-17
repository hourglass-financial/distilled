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
export interface GroupsControllerCreateInput {
  organizationId: string;
  name: string;
  description?: string | null;
}
export const GroupsControllerCreateInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    organizationId: Schema.String.pipe(T.PathParam()),
    name: Schema.String,
    description: Schema.optional(Schema.NullOr(Schema.String)),
  }).pipe(
    T.Http({ method: "POST", path: "/organizations/{organizationId}/groups" }),
  ) as unknown as GeneratedStructCodec<GroupsControllerCreateInput>;

// Output Schema
export interface GroupsControllerCreateOutput {
  object: "group";
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}
export const GroupsControllerCreateOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["group"]),
    id: Schema.String,
    organization_id: Schema.String,
    name: Schema.String,
    description: Schema.NullOr(Schema.String),
    created_at: Schema.String,
    updated_at: Schema.String,
  }) as unknown as GeneratedStructCodec<GroupsControllerCreateOutput>;

// The operation
/**
 * Create a group
 *
 * Create a new group within an organization.
 *
 * @param organizationId - The ID of the organization.
 */
export const GroupsControllerCreate = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: GroupsControllerCreateInput,
    outputSchema: GroupsControllerCreateOutput,
    errors: [BadRequest, Forbidden, NotFound, UnprocessableEntity] as const,
  }),
);
