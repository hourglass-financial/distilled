#!/usr/bin/env bun

import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

interface SmokeOptions {
  readonly packageName: string;
  readonly tag: string;
  readonly registry: string;
  readonly packageManager: "bun" | "npm";
  readonly keepTemp: boolean;
  readonly dryRun: boolean;
}

interface SmokePlan {
  readonly packageSpec: string;
  readonly npmrc: string;
  readonly installCommand: readonly string[];
  readonly importCommand: readonly string[];
}

const DEFAULT_PACKAGE = "@hourglass-financial/erebor";
const DEFAULT_TAG = "erebor-sdk";
const DEFAULT_REGISTRY = "https://npm.pkg.github.com";

const resolveAuthToken = (env: NodeJS.ProcessEnv = process.env): string => {
  const token = env.NODE_AUTH_TOKEN ?? env.GITHUB_TOKEN ?? env.GH_TOKEN;
  if (!token) {
    throw new Error(
      "Missing GitHub Packages token. Set NODE_AUTH_TOKEN, GITHUB_TOKEN, or GH_TOKEN.",
    );
  }
  return token;
};

const buildSmokePlan = (options: SmokeOptions): SmokePlan => {
  const scope = options.packageName.split("/")[0];
  const packageSpec = `${options.packageName}@${options.tag}`;

  return {
    packageSpec,
    npmrc: [
      `${scope}:registry=${options.registry}`,
      `//${new URL(options.registry).host}/:_authToken=\${NODE_AUTH_TOKEN}`,
      "",
    ].join("\n"),
    installCommand:
      options.packageManager === "bun"
        ? ["bun", "add", packageSpec]
        : ["npm", "install", packageSpec],
    importCommand:
      options.packageManager === "bun"
        ? ["bun", "./check-erebor-import.mjs"]
        : ["node", "./check-erebor-import.mjs"],
  };
};

const runCommand = (
  command: readonly string[],
  cwd: string,
  env: NodeJS.ProcessEnv,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const child = spawn(command[0], command.slice(1), {
      cwd,
      env,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command.join(" ")} failed with exit code ${code}`));
      }
    });
  });

const runSmokeInstall = async (
  options: SmokeOptions,
  env: NodeJS.ProcessEnv = process.env,
): Promise<string> => {
  const plan = buildSmokePlan(options);
  const token = options.dryRun ? "dry-run-token" : resolveAuthToken(env);
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "erebor-smoke-"));

  await writeFile(
    path.join(tempDir, "package.json"),
    `${JSON.stringify({ type: "module", private: true }, null, 2)}\n`,
  );
  await writeFile(path.join(tempDir, ".npmrc"), plan.npmrc);
  await writeFile(
    path.join(tempDir, "check-erebor-import.mjs"),
    [
      `const mod = await import(${JSON.stringify(options.packageName)});`,
      "if (!mod) throw new Error('Erebor package import returned no module');",
      "console.log('Erebor package import succeeded');",
      "",
    ].join("\n"),
  );

  if (options.dryRun) {
    console.log(`Smoke project prepared at ${tempDir}`);
    console.log(`Install command: ${plan.installCommand.join(" ")}`);
    return tempDir;
  }

  const commandEnv = {
    ...env,
    NODE_AUTH_TOKEN: token,
  };
  await runCommand(plan.installCommand, tempDir, commandEnv);
  await runCommand(plan.importCommand, tempDir, commandEnv);

  if (!options.keepTemp) {
    await rm(tempDir, { recursive: true, force: true });
  }

  return tempDir;
};

const usage = (): string =>
  [
    "Usage: bun scripts/smoke-github-erebor-install.ts [options]",
    "",
    "Options:",
    "  --package <name>          Package to install (default: @hourglass-financial/erebor)",
    "  --tag <tag>                Version or dist-tag (default: erebor-sdk)",
    "  --registry <url>           Registry URL (default: https://npm.pkg.github.com)",
    "  --package-manager <bun|npm> Install tool (default: bun)",
    "  --keep-temp                Do not delete the temp project after success",
    "  --dry-run                  Prepare files and print commands without installing",
  ].join("\n");

const parseArgs = (argv: readonly string[]): SmokeOptions => {
  const options: SmokeOptions = {
    packageName: DEFAULT_PACKAGE,
    tag: DEFAULT_TAG,
    registry: DEFAULT_REGISTRY,
    packageManager: "bun",
    keepTemp: false,
    dryRun: false,
  };
  const nextOptions = { ...options };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === "--package" && next) {
      nextOptions.packageName = next;
      i += 1;
    } else if (arg === "--tag" && next) {
      nextOptions.tag = next;
      i += 1;
    } else if (arg === "--registry" && next) {
      nextOptions.registry = next;
      i += 1;
    } else if (arg === "--package-manager" && next) {
      if (next !== "bun" && next !== "npm") {
        throw new Error(`Unsupported package manager: ${next}`);
      }
      nextOptions.packageManager = next;
      i += 1;
    } else if (arg === "--keep-temp") {
      nextOptions.keepTemp = true;
    } else if (arg === "--dry-run") {
      nextOptions.dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else {
      throw new Error(`Unknown or incomplete argument: ${arg}\n\n${usage()}`);
    }
  }

  return nextOptions;
};

if (import.meta.main) {
  try {
    const tempDir = await runSmokeInstall(parseArgs(process.argv.slice(2)));
    console.log(`Smoke project: ${tempDir}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
