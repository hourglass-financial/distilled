import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { NotFound } from "../errors.ts";

// Input Schema
export interface ProviderControllerListForOrganizationInput {
  organizationId: string;
}
export const ProviderControllerListForOrganizationInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    organizationId: Schema.String.pipe(T.PathParam()),
  }).pipe(
    T.Http({
      method: "GET",
      path: "/organizations/{organizationId}/data_integration_configurations",
    }),
  ) as unknown as GeneratedStructCodec<ProviderControllerListForOrganizationInput>;

// Output Schema
export interface ProviderControllerListForOrganizationOutput {
  object: "list";
  data: ReadonlyArray<{
    object: "data_integration_configuration";
    id: string;
    organization_id: string;
    slug: string;
    name: string;
    enabled: boolean;
    scopes: ReadonlyArray<string> | null;
    created_at: string;
    updated_at: string;
    credentials?: {
      credentials_type: "shared" | "custom" | "organization";
      has_credentials: boolean;
      client_id: string | null;
      client_secret_last_four: string | null;
      redirect_uri: string;
    };
  }>;
}
export const ProviderControllerListForOrganizationOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["list"]),
    data: Schema.Array(
      Schema.Struct({
        object: Schema.Literals(["data_integration_configuration"]),
        id: Schema.String,
        organization_id: Schema.String,
        slug: Schema.String,
        name: Schema.String,
        enabled: Schema.Boolean,
        scopes: Schema.NullOr(Schema.Array(Schema.String)),
        created_at: Schema.String,
        updated_at: Schema.String,
        credentials: Schema.optional(
          Schema.Struct({
            credentials_type: Schema.Literals([
              "shared",
              "custom",
              "organization",
            ]),
            has_credentials: Schema.Boolean,
            client_id: Schema.NullOr(Schema.String),
            client_secret_last_four: Schema.NullOr(Schema.String),
            redirect_uri: Schema.String,
          }),
        ),
      }),
    ),
  }) as unknown as GeneratedStructCodec<ProviderControllerListForOrganizationOutput>;

// The operation
/**
 * List providers for an organization
 *
 * Returns a list of all providers available to the specified organization, along with any configured custom OAuth scopes, enabled state, and organization-managed credentials where applicable.
 *
 * @param organizationId - An [Organization](/reference/organization) identifier to list provider configurations for.
 */
export const ProviderControllerListForOrganization =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: ProviderControllerListForOrganizationInput,
    outputSchema: ProviderControllerListForOrganizationOutput,
    errors: [NotFound] as const,
  }));
