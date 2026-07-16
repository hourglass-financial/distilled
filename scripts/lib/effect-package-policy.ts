import { readFile } from "node:fs/promises";
import path from "node:path";

export interface EffectCompatibilityPolicy {
  readonly typescriptVersion: string;
  readonly effectVersion: string;
}

type JsonObject = Record<string, unknown>;

const EXACT_EFFECT_PRERELEASE = /^4\.0\.0-beta\.\d+$/;

export const readEffectCompatibilityPolicy = async (
  rootDir: string,
): Promise<EffectCompatibilityPolicy> => {
  const policy = JSON.parse(
    await readFile(
      path.join(rootDir, "scripts/effect-compatibility-versions.json"),
      "utf8",
    ),
  ) as EffectCompatibilityPolicy;

  if (
    typeof policy.typescriptVersion !== "string" ||
    !/^\d+\.\d+\.\d+$/.test(policy.typescriptVersion)
  ) {
    throw new Error(
      "Effect compatibility policy requires an exact TypeScript version",
    );
  }
  if (
    typeof policy.effectVersion !== "string" ||
    !EXACT_EFFECT_PRERELEASE.test(policy.effectVersion)
  ) {
    throw new Error(
      "Effect compatibility policy requires an exact Effect 4 prerelease",
    );
  }

  return policy;
};

export const assertSourceEffectPackagePolicy = (
  manifest: JsonObject,
  packageName: string,
  policy: EffectCompatibilityPolicy,
  options: { readonly allowCatalogPeer: boolean },
): void => {
  const dependencies = manifest.dependencies as JsonObject | undefined;
  const peerDependencies = manifest.peerDependencies as JsonObject | undefined;
  if (dependencies?.effect !== undefined) {
    throw new Error(
      `${packageName}: effect must be consumer-supplied through peerDependencies, not dependencies`,
    );
  }
  const peer = peerDependencies?.effect;
  if (typeof peer !== "string") {
    throw new Error(`${packageName}: missing required effect peer dependency`);
  }
  if (options.allowCatalogPeer && peer.startsWith("catalog:")) return;
  if (peer !== policy.effectVersion) {
    throw new Error(
      `${packageName}: effect peer ${peer} does not match verified policy ${policy.effectVersion}`,
    );
  }
};

export const applyEffectPackagePolicy = (
  manifest: JsonObject,
  packageName: string,
  policy: EffectCompatibilityPolicy,
): JsonObject => {
  const dependencies = manifest.dependencies as JsonObject | undefined;
  const peerDependencies = manifest.peerDependencies as JsonObject | undefined;

  if (dependencies?.effect !== undefined) {
    throw new Error(
      `${packageName}: effect must be consumer-supplied through peerDependencies, not dependencies`,
    );
  }
  if (!peerDependencies || peerDependencies.effect === undefined) {
    throw new Error(`${packageName}: missing required effect peer dependency`);
  }

  return {
    ...manifest,
    peerDependencies: {
      ...peerDependencies,
      effect: policy.effectVersion,
    },
  };
};

export const assertWorkspaceEffectIsVerified = async (
  rootDir: string,
  policy: EffectCompatibilityPolicy,
): Promise<void> => {
  const manifest = JSON.parse(
    await readFile(
      path.join(rootDir, "node_modules/effect/package.json"),
      "utf8",
    ),
  ) as { readonly version?: string };
  if (manifest.version !== policy.effectVersion) {
    throw new Error(
      `Workspace effect version ${manifest.version ?? "<missing>"} is not in the verified private-package policy`,
    );
  }
  const typescriptManifest = JSON.parse(
    await readFile(
      path.join(rootDir, "node_modules/typescript/package.json"),
      "utf8",
    ),
  ) as { readonly version?: string };
  if (typescriptManifest.version !== policy.typescriptVersion) {
    throw new Error(
      `Workspace TypeScript version ${typescriptManifest.version ?? "<missing>"} does not match compatibility policy ${policy.typescriptVersion}`,
    );
  }
};
