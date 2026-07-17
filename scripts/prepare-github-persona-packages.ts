#!/usr/bin/env bun

import {
  prepareGithubProviderPackages,
  runPrepareGithubProviderPackagesCli,
  type PrepareOptions,
} from "./lib/prepare-github-provider-packages.ts";

const config = {
  sourceName: "@distilled.cloud/persona",
  privateName: "@hourglass-financial/persona",
  directory: "packages/persona",
  displayName: "Persona",
  distTag: "persona-sdk",
  credentialEnvironmentVariable: "PERSONA_API_KEY",
  exampleOperation: "listAllAccounts",
  scriptName: "prepare-github-persona-packages.ts",
  defaultStageDir: ".ai-workspace/github-persona-packages",
} as const;

export const prepareGithubPersonaPackages = (options: PrepareOptions) =>
  prepareGithubProviderPackages(options, config);

if (import.meta.main) await runPrepareGithubProviderPackagesCli(config);
