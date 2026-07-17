import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { NotFound } from "../errors.ts";

// Input Schema
export interface DataIntegrationsUserManagementControllerGetUserDataInstallationInput {
  user_id: string;
  slug: string;
  organization_id?: string;
}
export const DataIntegrationsUserManagementControllerGetUserDataInstallationInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    user_id: Schema.String.pipe(T.PathParam()),
    slug: Schema.String.pipe(T.PathParam()),
    organization_id: Schema.optional(Schema.String).pipe(
      T.HttpQuery("organization_id"),
    ),
  }).pipe(
    T.Http({
      method: "GET",
      path: "/user_management/users/{user_id}/connected_accounts/{slug}",
    }),
  ) as unknown as GeneratedStructCodec<DataIntegrationsUserManagementControllerGetUserDataInstallationInput>;

// Output Schema
export interface DataIntegrationsUserManagementControllerGetUserDataInstallationOutput {
  object: "connected_account";
  id: string;
  user_id: string | null;
  organization_id: string | null;
  scopes: ReadonlyArray<string>;
  auth_method?: "oauth" | "api_key";
  api_key_last_4?: string | null;
  state: "connected" | "needs_reauthorization" | "disconnected";
  created_at: string;
  updated_at: string;
}
export const DataIntegrationsUserManagementControllerGetUserDataInstallationOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["connected_account"]),
    id: Schema.String,
    user_id: Schema.NullOr(Schema.String),
    organization_id: Schema.NullOr(Schema.String),
    scopes: Schema.Array(Schema.String),
    auth_method: Schema.optional(Schema.Literals(["oauth", "api_key"])),
    api_key_last_4: Schema.optional(Schema.NullOr(Schema.String)),
    state: Schema.Literals([
      "connected",
      "needs_reauthorization",
      "disconnected",
    ]),
    created_at: Schema.String,
    updated_at: Schema.String,
  }) as unknown as GeneratedStructCodec<DataIntegrationsUserManagementControllerGetUserDataInstallationOutput>;

// The operation
/**
 * Get a connected account
 *
 * Retrieves a user's [connected account](/reference/pipes/connected-account) for a specific provider.
 *
 * @param user_id - A [User](/reference/authkit/user) identifier.
 * @param slug - The slug identifier of the provider (e.g., `github`, `slack`, `notion`).
 * @param organization_id - An [Organization](/reference/organization) identifier. Optional parameter if the connection is scoped to an organization.
 */
export const DataIntegrationsUserManagementControllerGetUserDataInstallation =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema:
      DataIntegrationsUserManagementControllerGetUserDataInstallationInput,
    outputSchema:
      DataIntegrationsUserManagementControllerGetUserDataInstallationOutput,
    errors: [NotFound] as const,
  }));
