import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { Conflict } from "../errors.ts";

// Input Schema
export interface OrganizationDomainsControllerCreateInput {
  domain: string;
  organization_id: string;
}
export const OrganizationDomainsControllerCreateInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    domain: Schema.String,
    organization_id: Schema.String,
  }).pipe(
    T.Http({ method: "POST", path: "/organization_domains" }),
  ) as unknown as GeneratedStructCodec<OrganizationDomainsControllerCreateInput>;

// Output Schema
export interface OrganizationDomainsControllerCreateOutput {
  object: "organization_domain";
  id: string;
  organization_id: string;
  domain: string;
  state?: "failed" | "legacy_verified" | "pending" | "unverified" | "verified";
  verification_prefix?: string;
  verification_token?: string;
  verification_strategy?: "dns" | "manual";
  created_at: string;
  updated_at: string;
}
export const OrganizationDomainsControllerCreateOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
    verification_strategy: Schema.optional(Schema.Literals(["dns", "manual"])),
    created_at: Schema.String,
    updated_at: Schema.String,
  }) as unknown as GeneratedStructCodec<OrganizationDomainsControllerCreateOutput>;

// The operation
/**
 * Create an Organization Domain
 *
 * Creates a new Organization Domain.
 */
export const OrganizationDomainsControllerCreate =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: OrganizationDomainsControllerCreateInput,
    outputSchema: OrganizationDomainsControllerCreateOutput,
    errors: [Conflict] as const,
  }));
