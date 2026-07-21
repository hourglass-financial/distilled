/**
 * Capability-declared vendor test environment (#30, decision 9).
 *
 * Base credentials gate live testing at all; every out-of-band ingredient
 * beyond them — an AuthKit client id, a dashboard-seeded fixture id — is a
 * named *capability* carried by env vars. Tests state `needs` and a missing
 * capability produces a precise, visible skip naming what's absent, so a
 * partially-seeded workspace yields exact skips instead of tier-level lies.
 * Seeded fixture ids are workspace-specific dashboard state: they live in env
 * vars, never in the repo.
 */
import * as Redacted from "effect/Redacted";

/** Declaration of a vendor's test environment. */
export interface EnvSpec<Caps extends string> {
  /** Vendor key, e.g. `"workos"` — also feeds resource naming. */
  readonly vendor: string;
  /** Env var holding the API key. Its presence is what makes a run live. */
  readonly apiKeyVar: string;
  /** Env var that may override the base URL. */
  readonly baseUrlVar?: string;
  /** Base URL when {@link baseUrlVar} is absent. */
  readonly defaultBaseUrl: string;
  /**
   * Named capabilities: each maps to the env vars that must ALL be present
   * for the capability to count as provisioned.
   */
  readonly capabilities: Readonly<Record<Caps, readonly string[]>>;
}

/** A resolved vendor environment, read once at definition time. */
export interface VendorEnv<Caps extends string = never> {
  readonly vendor: string;
  /** True when the base credential is present — live tests may run. */
  readonly live: boolean;
  /** The env var the base credential is read from (named in skip titles). */
  readonly apiKeyVar: string;
  /** The base credential, redacted; `undefined` on credential-less runs. */
  readonly apiKey: Redacted.Redacted<string> | undefined;
  readonly baseUrl: string;
  /** Every declared capability name, in declaration order. */
  readonly declared: readonly Caps[];
  /** True when every env var of `capability` is present. */
  readonly has: (capability: Caps) => boolean;
  /** The subset of `needs` not currently provisioned. */
  readonly missing: (needs: readonly Caps[]) => readonly Caps[];
  /**
   * Read a non-secret env var declared by some capability (a client id, a
   * seeded fixture id). Secrets stay behind {@link apiKey}.
   */
  readonly value: (envVar: string) => string | undefined;
}

const present = (value: string | undefined): value is string =>
  typeof value === "string" && value.length > 0;

/**
 * Resolve an {@link EnvSpec} against an env-var source (defaults to
 * `process.env`, injectable for tests). Reading happens once, here — the
 * environment a test run sees is fixed at collection.
 */
export const defineEnv = <const Caps extends string = never>(
  spec: EnvSpec<Caps>,
  source: Readonly<Record<string, string | undefined>> = process.env,
): VendorEnv<Caps> => {
  const rawKey = source[spec.apiKeyVar];
  const apiKey = present(rawKey) ? Redacted.make(rawKey) : undefined;
  const baseUrlOverride =
    spec.baseUrlVar !== undefined ? source[spec.baseUrlVar] : undefined;
  const declared = Object.keys(spec.capabilities) as Caps[];
  const provisioned = new Set<Caps>(
    declared.filter((capability) =>
      spec.capabilities[capability].every((envVar) => present(source[envVar])),
    ),
  );
  return {
    vendor: spec.vendor,
    live: apiKey !== undefined,
    apiKeyVar: spec.apiKeyVar,
    apiKey,
    baseUrl: present(baseUrlOverride) ? baseUrlOverride : spec.defaultBaseUrl,
    declared,
    has: (capability) => provisioned.has(capability),
    missing: (needs) => needs.filter((need) => !provisioned.has(need)),
    value: (envVar) => source[envVar],
  };
};
