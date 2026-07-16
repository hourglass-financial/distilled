#!/usr/bin/env bun

import { spawn } from "node:child_process";
import {
  copyFile,
  mkdtemp,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  readEffectCompatibilityPolicy,
  type EffectCompatibilityPolicy,
} from "./lib/effect-package-policy.ts";
import { assertSingleEffectInstallation } from "./lib/installed-effect.ts";
import {
  startStaticPackageRegistry,
  type StaticRegistryPackage,
} from "./lib/static-package-registry.ts";
import { prepareGithubEreborPackages } from "./prepare-github-erebor-packages.ts";
import { prepareGithubPersonaPackages } from "./prepare-github-persona-packages.ts";

type Provider = "persona" | "erebor";
type PackageManager = "bun" | "npm";

interface CommandResult {
  readonly stdout: string;
  readonly stderr: string;
}

interface PackOutput {
  readonly filename: string;
  readonly integrity: string;
  readonly shasum: string;
}

const SAFE_ENV_KEYS = [
  "PATH",
  "LANG",
  "LC_ALL",
  "TERM",
  "CI",
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "NO_PROXY",
  "SSL_CERT_FILE",
  "SSL_CERT_DIR",
] as const;

const safeEnvironment = (home: string): NodeJS.ProcessEnv => {
  const env: NodeJS.ProcessEnv = { HOME: home, TMPDIR: home };
  for (const key of SAFE_ENV_KEYS) {
    if (process.env[key] !== undefined) env[key] = process.env[key];
  }
  return env;
};

const run = (
  command: readonly [string, ...string[]],
  options: { readonly cwd: string; readonly env: NodeJS.ProcessEnv },
): Promise<CommandResult> =>
  new Promise((resolve, reject) => {
    const child = spawn(command[0], command.slice(1), {
      cwd: options.cwd,
      env: options.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += String(chunk)));
    child.stderr.on("data", (chunk) => (stderr += String(chunk)));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else {
        reject(
          new Error(
            `${command[0]} ${command.slice(1).join(" ")} failed (${code})\n${stdout}${stderr}`,
          ),
        );
      }
    });
  });

const packPackage = async (
  directory: string,
  packDir: string,
  env: NodeJS.ProcessEnv,
): Promise<StaticRegistryPackage> => {
  const manifest = JSON.parse(
    await readFile(path.join(directory, "package.json"), "utf8"),
  ) as Record<string, unknown> & {
    readonly name: string;
    readonly version: string;
  };
  const result = await run(
    ["npm", "pack", "--json", "--pack-destination", packDir, directory],
    { cwd: packDir, env },
  );
  const [packed] = JSON.parse(result.stdout) as PackOutput[];
  if (!packed?.integrity || !packed.shasum) {
    throw new Error(`npm pack did not report integrity for ${manifest.name}`);
  }
  return {
    name: manifest.name,
    version: manifest.version,
    manifest,
    tarballPath: path.join(packDir, packed.filename),
    integrity: packed.integrity,
    shasum: packed.shasum,
  };
};

const verifyCase = async (options: {
  readonly rootDir: string;
  readonly provider: Provider;
  readonly packageManager: PackageManager;
  readonly providerPackage: StaticRegistryPackage;
  readonly registryUrl: string;
  readonly policy: EffectCompatibilityPolicy;
  readonly effectVersion: string;
}): Promise<void> => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "effect-consumer-"));
  try {
    const env = safeEnvironment(tempDir);
    const fixtureDir = path.join(
      options.rootDir,
      "scripts/fixtures/effect-consumer",
    );
    await copyFile(
      path.join(fixtureDir, "tsconfig.json"),
      path.join(tempDir, "tsconfig.json"),
    );
    await copyFile(
      path.join(fixtureDir, `${options.provider}.ts`),
      path.join(tempDir, "index.ts"),
    );
    await copyFile(
      path.join(fixtureDir, `${options.provider}.runtime.mjs`),
      path.join(tempDir, "runtime.mjs"),
    );
    await writeFile(
      path.join(tempDir, ".npmrc"),
      `@hourglass-financial:registry=${options.registryUrl}\n`,
    );
    await writeFile(
      path.join(tempDir, "package.json"),
      `${JSON.stringify(
        {
          private: true,
          type: "module",
          dependencies: {
            [options.providerPackage.name]: options.providerPackage.version,
            effect: options.effectVersion,
            typescript: options.policy.typescriptVersion,
          },
        },
        null,
        2,
      )}\n`,
    );

    const install: readonly [string, ...string[]] =
      options.packageManager === "bun"
        ? ["bun", "install", "--ignore-scripts"]
        : ["npm", "install", "--ignore-scripts", "--no-audit", "--no-fund"];
    await run(install, { cwd: tempDir, env });

    await assertSingleEffectInstallation(
      path.join(tempDir, "node_modules"),
      options.effectVersion,
    );
    const installedCore = JSON.parse(
      await readFile(
        path.join(tempDir, "node_modules/@distilled.cloud/core/package.json"),
        "utf8",
      ),
    ) as { readonly name?: string; readonly version?: string };
    if (
      installedCore.name !== "@hourglass-financial/distilled-core" ||
      installedCore.version !== options.providerPackage.version
    ) {
      throw new Error(
        `Provider did not resolve the staged private core at ${options.providerPackage.version}`,
      );
    }

    await run(
      ["node", "node_modules/typescript/bin/tsc", "-p", "tsconfig.json"],
      { cwd: tempDir, env },
    );
    await run(["node", "runtime.mjs"], { cwd: tempDir, env });
    console.log(
      `PASS ${options.provider} ${options.packageManager} effect@${options.effectVersion} (one instance, strict types, runtime import)`,
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
};

export const checkEffectCompatibility = async (
  rootDir = process.cwd(),
): Promise<void> => {
  const policy = await readEffectCompatibilityPolicy(rootDir);
  const workDir = await mkdtemp(
    path.join(os.tmpdir(), "effect-compatibility-"),
  );
  const personaStage = path.join(
    rootDir,
    ".ai-workspace/effect-compat-persona",
  );
  const ereborStage = path.join(rootDir, ".ai-workspace/effect-compat-erebor");
  try {
    const env = safeEnvironment(workDir);
    await run(["bun", "--filter", "@distilled.cloud/core", "build"], {
      cwd: rootDir,
      env,
    });
    for (const provider of ["persona", "erebor"] as const) {
      await run(["bun", "--filter", `@distilled.cloud/${provider}`, "build"], {
        cwd: rootDir,
        env,
      });
    }

    const version = `0.0.0-effect-compat.${Date.now()}`;
    const persona = await prepareGithubPersonaPackages({
      rootDir,
      stageDir: personaStage,
      version,
      force: false,
    });
    const erebor = await prepareGithubEreborPackages({
      rootDir,
      stageDir: ereborStage,
      version,
      force: false,
    });
    for (const prepared of [...persona, ...erebor]) {
      if (prepared.name === "@hourglass-financial/distilled-core") continue;
      const readme = await readFile(
        path.join(prepared.directory, "README.md"),
        "utf8",
      );
      if (!readme.includes(`effect@${policy.effectVersion}`)) {
        throw new Error(
          `${prepared.name}: installation instructions do not pin the verified Effect version`,
        );
      }
    }
    const byName = new Map(
      [...persona, ...erebor].map((pkg) => [pkg.name, pkg]),
    );
    const packDir = path.join(workDir, "packs");
    await mkdir(packDir, { recursive: true });
    const packages = await Promise.all(
      [
        "@hourglass-financial/distilled-core",
        "@hourglass-financial/persona",
        "@hourglass-financial/erebor",
      ].map((name) => {
        const pkg = byName.get(name);
        if (!pkg) throw new Error(`Missing staged package ${name}`);
        return packPackage(pkg.directory, packDir, env);
      }),
    );
    const registry = await startStaticPackageRegistry(packages);
    try {
      for (const provider of ["persona", "erebor"] as const) {
        const providerPackage = packages.find(
          (pkg) => pkg.name === `@hourglass-financial/${provider}`,
        );
        if (!providerPackage) throw new Error(`Missing packed ${provider}`);
        for (const packageManager of ["npm", "bun"] as const) {
          await verifyCase({
            rootDir,
            provider,
            packageManager,
            providerPackage,
            registryUrl: registry.url,
            policy,
            effectVersion: policy.effectVersion,
          });
        }
      }
    } finally {
      await registry.close();
    }
  } finally {
    await Promise.all(
      [workDir, personaStage, ereborStage].map((directory) =>
        rm(directory, { recursive: true, force: true }),
      ),
    );
  }
};

if (import.meta.main) {
  try {
    await checkEffectCompatibility();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
