import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { NotFound, UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface ApplicationsControllerCreateInput {
  name?: string;
  application_type?: string;
  description?: string | null;
  scopes?: ReadonlyArray<string> | null;
  redirect_uris?: ReadonlyArray<{
    uri?: string;
    default?: boolean | null;
  }> | null;
  uses_pkce?: boolean | null;
  is_first_party?: boolean;
  organization_id?: string | null | string;
}
export const ApplicationsControllerCreateInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    name: Schema.optional(Schema.String),
    application_type: Schema.optional(Schema.String),
    description: Schema.optional(Schema.NullOr(Schema.String)),
    scopes: Schema.optional(Schema.NullOr(Schema.Array(Schema.String))),
    redirect_uris: Schema.optional(
      Schema.NullOr(
        Schema.Array(
          Schema.Struct({
            uri: Schema.optional(Schema.String),
            default: Schema.optional(Schema.NullOr(Schema.Boolean)),
          }),
        ),
      ),
    ),
    uses_pkce: Schema.optional(Schema.NullOr(Schema.Boolean)),
    is_first_party: Schema.optional(Schema.Boolean),
    organization_id: Schema.optional(
      Schema.Union([Schema.NullOr(Schema.String), Schema.String]),
    ),
  }).pipe(
    T.Http({ method: "POST", path: "/connect/applications" }),
  ) as unknown as Schema.Codec<ApplicationsControllerCreateInput>;

// Output Schema
export interface ApplicationsControllerCreateOutput {
  object: string;
  id: string;
  client_id: string;
  description: string | null;
  name: string;
  scopes: ReadonlyArray<string>;
  created_at: string;
  updated_at: string;
}
export const ApplicationsControllerCreateOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.String,
    id: Schema.String,
    client_id: Schema.String,
    description: Schema.NullOr(Schema.String),
    name: Schema.String,
    scopes: Schema.Array(Schema.String),
    created_at: Schema.String,
    updated_at: Schema.String,
  }) as unknown as Schema.Codec<ApplicationsControllerCreateOutput>;

// The operation
/**
 * Create a Connect Application
 *
 * Create a new Connect Application. Supports both OAuth and Machine-to-Machine (M2M) application types.
 */
export const ApplicationsControllerCreate =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: ApplicationsControllerCreateInput,
    outputSchema: ApplicationsControllerCreateOutput,
    errors: [NotFound, UnprocessableEntity] as const,
  }));
