import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface DirectoryGroupsControllerFindInput {
  id: string;
}
export const DirectoryGroupsControllerFindInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
  }).pipe(
    T.Http({ method: "GET", path: "/directory_groups/{id}" }),
  ) as unknown as GeneratedStructCodec<DirectoryGroupsControllerFindInput>;

// Output Schema
export interface DirectoryGroupsControllerFindOutput {
  object: "directory_group";
  id: string;
  idp_id: string;
  directory_id: string;
  organization_id: string;
  name: string;
  raw_attributes?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
export const DirectoryGroupsControllerFindOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["directory_group"]),
    id: Schema.String,
    idp_id: Schema.String,
    directory_id: Schema.String,
    organization_id: Schema.String,
    name: Schema.String,
    raw_attributes: Schema.optional(
      Schema.Record(Schema.String, Schema.Unknown),
    ),
    created_at: Schema.String,
    updated_at: Schema.String,
  }) as unknown as GeneratedStructCodec<DirectoryGroupsControllerFindOutput>;

// The operation
/**
 * Get a Directory Group
 *
 * Get the details of an existing Directory Group.
 *
 * @param id - Unique identifier for the Directory Group.
 */
export const DirectoryGroupsControllerFind =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: DirectoryGroupsControllerFindInput,
    outputSchema: DirectoryGroupsControllerFindOutput,
    errors: [Forbidden, NotFound] as const,
  }));
