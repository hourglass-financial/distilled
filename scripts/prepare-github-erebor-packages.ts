#!/usr/bin/env bun

import {
  prepareGithubProviderPackages,
  runPrepareGithubProviderPackagesCli,
  type PrepareOptions,
} from "./lib/prepare-github-provider-packages.ts";

const config = {
  sourceName: "@distilled.cloud/erebor",
  privateName: "@hourglass-financial/erebor",
  directory: "packages/erebor",
  displayName: "Erebor",
  distTag: "erebor-sdk",
  credentialEnvironmentVariable: "EREBOR_API_KEY",
  exampleOperation: "listPrograms",
  scriptName: "prepare-github-erebor-packages.ts",
  defaultStageDir: ".ai-workspace/github-erebor-packages",
} as const;

export const prepareGithubEreborPackages = (options: PrepareOptions) =>
  prepareGithubProviderPackages(options, config);

if (import.meta.main) await runPrepareGithubProviderPackagesCli(config);
