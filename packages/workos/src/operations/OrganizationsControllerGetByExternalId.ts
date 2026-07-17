import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { NotFound } from "../errors.ts";

// Input Schema
export interface OrganizationsControllerGetByExternalIdInput {
  external_id: string;
}
export const OrganizationsControllerGetByExternalIdInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    external_id: Schema.String.pipe(T.PathParam()),
  }).pipe(
    T.Http({ method: "GET", path: "/organizations/external_id/{external_id}" }),
  ) as unknown as GeneratedStructCodec<OrganizationsControllerGetByExternalIdInput>;

// Output Schema
export interface OrganizationsControllerGetByExternalIdOutput {
  object: "organization";
  id: string;
  name: string;
  domains: ReadonlyArray<{
    object: "organization_domain";
    id: string;
    organization_id: string;
    domain: string;
    state?:
      | "failed"
      | "legacy_verified"
      | "pending"
      | "unverified"
      | "verified";
    verification_prefix?: string;
    verification_token?: string;
    verification_strategy?: "dns" | "manual";
    created_at: string;
    updated_at: string;
  }>;
  metadata: Record<string, string>;
  external_id: string | null;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
  allow_profiles_outside_organization?: boolean;
}
export const OrganizationsControllerGetByExternalIdOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["organization"]),
    id: Schema.String,
    name: Schema.String,
    domains: Schema.Array(
      Schema.Struct({
        object: Schema.Literals(["organization_domain"]),
        id: Schema.String,
        organization_id: Schema.String,
        domain: Schema.String,
        state: Schema.optional(
          Schema.Literals([
            "failed",
            "legacy_verified",
            "pending",
            "unverified",
            "verified",
          ]),
        ),
        verification_prefix: Schema.optional(Schema.String),
        verification_token: Schema.optional(Schema.String),
        verification_strategy: Schema.optional(
          Schema.Literals(["dns", "manual"]),
        ),
        created_at: Schema.String,
        updated_at: Schema.String,
      }),
    ),
    metadata: Schema.Record(Schema.String, Schema.String),
    external_id: Schema.NullOr(Schema.String),
    stripe_customer_id: Schema.optional(Schema.String),
    created_at: Schema.String,
    updated_at: Schema.String,
    allow_profiles_outside_organization: Schema.optional(Schema.Boolean),
  }) as unknown as GeneratedStructCodec<OrganizationsControllerGetByExternalIdOutput>;

// The operation
/**
 * Get an Organization by External ID
 *
 * Get the details of an existing organization by an [external identifier](/authkit/metadata/external-identifiers).
 *
 * @param external_id - The external ID of the Organization.
 */
export const OrganizationsControllerGetByExternalId =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: OrganizationsControllerGetByExternalIdInput,
    outputSchema: OrganizationsControllerGetByExternalIdOutput,
    errors: [NotFound] as const,
  }));
