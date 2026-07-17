#!/usr/bin/env bun

import {
  prepareGithubProviderPackages,
  runPrepareGithubProviderPackagesCli,
  type PrepareOptions,
} from "./lib/prepare-github-provider-packages.ts";

const config = {
  sourceName: "@distilled.cloud/workos",
  privateName: "@hourglass-financial/workos",
  directory: "packages/workos",
  displayName: "WorkOS",
  distTag: "workos-sdk",
  credentialEnvironmentVariable: "WORKOS_API_KEY",
  exampleOperation: "UserlandUserOrganizationMembershipsControllerUpdate",
  allowCatalogEffectPeer: true,
  scriptName: "prepare-github-workos-packages.ts",
  defaultStageDir: ".ai-workspace/github-workos-packages",
} as const;

export const prepareGithubWorkosPackages = (options: PrepareOptions) =>
  prepareGithubProviderPackages(options, config);

if (import.meta.main) await runPrepareGithubProviderPackagesCli(config);
