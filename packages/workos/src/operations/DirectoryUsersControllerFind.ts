import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface DirectoryUsersControllerFindInput {
  id: string;
}
export const DirectoryUsersControllerFindInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
  }).pipe(
    T.Http({ method: "GET", path: "/directory_users/{id}" }),
  ) as unknown as GeneratedStructCodec<DirectoryUsersControllerFindInput>;

// Output Schema
export interface DirectoryUsersControllerFindOutput {
  object: "directory_user";
  id: string;
  directory_id: string;
  organization_id: string;
  idp_id: string;
  email: string | null;
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  emails?: ReadonlyArray<{
    primary?: boolean;
    type?: string;
    value?: string | null;
  }>;
  job_title?: string | null;
  username?: string | null;
  state: "active" | "suspended" | "inactive";
  raw_attributes: Record<string, unknown>;
  custom_attributes: Record<string, unknown>;
  role?: { slug: string };
  roles?: ReadonlyArray<{ slug: string }>;
  created_at: string;
  updated_at: string;
  groups: ReadonlyArray<{
    object: "directory_group";
    id: string;
    idp_id: string;
    directory_id: string;
    organization_id: string;
    name: string;
    raw_attributes?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  }>;
}
export const DirectoryUsersControllerFindOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["directory_user"]),
    id: Schema.String,
    directory_id: Schema.String,
    organization_id: Schema.String,
    idp_id: Schema.String,
    email: Schema.NullOr(Schema.String),
    first_name: Schema.optional(Schema.NullOr(Schema.String)),
    last_name: Schema.optional(Schema.NullOr(Schema.String)),
    name: Schema.optional(Schema.NullOr(Schema.String)),
    emails: Schema.optional(
      Schema.Array(
        Schema.Struct({
          primary: Schema.optional(Schema.Boolean),
          type: Schema.optional(Schema.String),
          value: Schema.optional(Schema.NullOr(Schema.String)),
        }),
      ),
    ),
    job_title: Schema.optional(Schema.NullOr(Schema.String)),
    username: Schema.optional(Schema.NullOr(Schema.String)),
    state: Schema.Literals(["active", "suspended", "inactive"]),
    raw_attributes: Schema.Record(Schema.String, Schema.Unknown),
    custom_attributes: Schema.Record(Schema.String, Schema.Unknown),
    role: Schema.optional(
      Schema.Struct({
        slug: Schema.String,
      }),
    ),
    roles: Schema.optional(
      Schema.Array(
        Schema.Struct({
          slug: Schema.String,
        }),
      ),
    ),
    created_at: Schema.String,
    updated_at: Schema.String,
    groups: Schema.Array(
      Schema.Struct({
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
      }),
    ),
  }) as unknown as GeneratedStructCodec<DirectoryUsersControllerFindOutput>;

// The operation
/**
 * Get a Directory User
 *
 * Get the details of an existing Directory User.
 *
 * @param id - Unique identifier for the Directory User.
 */
export const DirectoryUsersControllerFind =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: DirectoryUsersControllerFindInput,
    outputSchema: DirectoryUsersControllerFindOutput,
    errors: [Forbidden, NotFound] as const,
  }));
