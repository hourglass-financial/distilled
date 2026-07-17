import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, Conflict, UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface OrganizationsControllerCreateInput {
  name?: string;
  allow_profiles_outside_organization?: boolean;
  domains?: ReadonlyArray<string>;
  domain_data?: ReadonlyArray<{
    domain: string;
    state: "pending" | "verified";
  }>;
  metadata?: Record<string, string> | null;
  external_id?: string | null;
}
export const OrganizationsControllerCreateInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    name: Schema.optional(Schema.String),
    allow_profiles_outside_organization: Schema.optional(Schema.Boolean),
    domains: Schema.optional(Schema.Array(Schema.String)),
    domain_data: Schema.optional(
      Schema.Array(
        Schema.Struct({
          domain: Schema.String,
          state: Schema.Literals(["pending", "verified"]),
        }),
      ),
    ),
    metadata: Schema.optional(
      Schema.NullOr(Schema.Record(Schema.String, Schema.String)),
    ),
    external_id: Schema.optional(Schema.NullOr(Schema.String)),
  }).pipe(
    T.Http({ method: "POST", path: "/organizations" }),
  ) as unknown as GeneratedStructCodec<OrganizationsControllerCreateInput>;

// Output Schema
export interface OrganizationsControllerCreateOutput {
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
export const OrganizationsControllerCreateOutput =
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
  }) as unknown as GeneratedStructCodec<OrganizationsControllerCreateOutput>;

// The operation
/**
 * Create an Organization
 *
 * Creates a new organization in the current environment.
 */
export const OrganizationsControllerCreate =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: OrganizationsControllerCreateInput,
    outputSchema: OrganizationsControllerCreateOutput,
    errors: [BadRequest, Conflict, UnprocessableEntity] as const,
  }));
