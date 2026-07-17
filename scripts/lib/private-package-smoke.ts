import { spawn } from "node:child_process";
import { copyFile, mkdtemp, rm, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

import {
  readEffectCompatibilityPolicy,
  type EffectCompatibilityPolicy,
} from "./effect-package-policy.ts";
import { assertSingleEffectInstallation } from "./installed-effect.ts";

export const GITHUB_PACKAGES_REGISTRY = "https://npm.pkg.github.com";

const SAFE_ENV_KEYS = [
  "PATH",
  "LANG",
  "LC_ALL",
  "TERM",
  "CI",
  "GITHUB_ACTIONS",
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "NO_PROXY",
  "SSL_CERT_FILE",
  "SSL_CERT_DIR",
] as const;

export interface PrivatePackageSmokeOptions {
  readonly rootDir?: string;
  readonly provider: "persona" | "erebor" | "workos";
  readonly packageName: string;
  readonly tag: string;
  readonly packageManager: "bun" | "npm";
  readonly keepTemp: boolean;
  readonly dryRun: boolean;
}

export type PrivatePackageSmokeResult =
  | { readonly preserved: false }
  | { readonly preserved: true; readonly tempDir: string };

export const assertGitHubPackagesRegistry = (registry: string): string => {
  const parsed = new URL(registry);
  if (
    parsed.protocol !== "https:" ||
    parsed.hostname !== "npm.pkg.github.com" ||
    parsed.port ||
    parsed.username ||
    parsed.password ||
    (parsed.pathname !== "" && parsed.pathname !== "/") ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error(
      "Authenticated package smoke tests require https://npm.pkg.github.com",
    );
  }
  return GITHUB_PACKAGES_REGISTRY;
};

export const resolveGitHubPackagesReadToken = (
  env: NodeJS.ProcessEnv = process.env,
): string => {
  if (env.NODE_AUTH_TOKEN) return env.NODE_AUTH_TOKEN;
  if (env.GITHUB_ACTIONS === "true" && env.GITHUB_TOKEN)
    return env.GITHUB_TOKEN;
  throw new Error(
    "Missing GitHub Packages token. Set NODE_AUTH_TOKEN (or GITHUB_TOKEN inside GitHub Actions).",
  );
};

const baseEnvironment = (
  sourceEnv: NodeJS.ProcessEnv,
  tempDir: string,
): NodeJS.ProcessEnv => {
  const env: NodeJS.ProcessEnv = {
    HOME: tempDir,
    TMPDIR: tempDir,
    NPM_CONFIG_USERCONFIG: path.join(tempDir, ".npmrc"),
  };
  for (const key of SAFE_ENV_KEYS) {
    if (sourceEnv[key] !== undefined) env[key] = sourceEnv[key];
  }
  return env;
};

export const buildSmokeEnvironments = (options: {
  readonly sourceEnv?: NodeJS.ProcessEnv;
  readonly tempDir: string;
  readonly token: string;
}): {
  readonly installEnv: NodeJS.ProcessEnv;
  readonly runtimeEnv: NodeJS.ProcessEnv;
  readonly npmrc: string;
} => {
  const sourceEnv = options.sourceEnv ?? process.env;
  const runtimeEnv = baseEnvironment(sourceEnv, options.tempDir);
  return {
    installEnv: { ...runtimeEnv, NODE_AUTH_TOKEN: options.token },
    runtimeEnv,
    npmrc: [
      `@hourglass-financial:registry=${GITHUB_PACKAGES_REGISTRY}`,
      "//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}",
      "",
    ].join("\n"),
  };
};

export const runChecked = (
  command: readonly [string, ...string[]],
  options: { readonly cwd: string; readonly env: NodeJS.ProcessEnv },
): Promise<void> =>
  new Promise((resolve, reject) => {
    const child = spawn(command[0], command.slice(1), {
      cwd: options.cwd,
      env: options.env,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else
        reject(new Error(`${command.join(" ")} failed with exit code ${code}`));
    });
  });

const installCommand = (
  packageManager: "bun" | "npm",
): readonly [string, ...string[]] =>
  packageManager === "bun"
    ? ["bun", "install", "--ignore-scripts", "--force", "--no-cache"]
    : [
        "npm",
        "install",
        "--ignore-scripts",
        "--prefer-online",
        "--no-audit",
        "--no-fund",
      ];

const prepareSmokeProject = async (options: {
  readonly tempDir: string;
  readonly rootDir: string;
  readonly provider: "persona" | "erebor" | "workos";
  readonly packageName: string;
  readonly tag: string;
  readonly policy: EffectCompatibilityPolicy;
  readonly npmrc: string;
}): Promise<void> => {
  const effectVersion = options.policy.effectVersion;
  await writeFile(
    path.join(options.tempDir, "package.json"),
    `${JSON.stringify(
      {
        private: true,
        type: "module",
        dependencies: {
          [options.packageName]: options.tag,
          effect: effectVersion,
          typescript: options.policy.typescriptVersion,
        },
      },
      null,
      2,
    )}\n`,
  );
  await writeFile(path.join(options.tempDir, ".npmrc"), options.npmrc);
  await copyFile(
    path.join(
      options.rootDir,
      "scripts/fixtures/effect-consumer/tsconfig.json",
    ),
    path.join(options.tempDir, "tsconfig.json"),
  );
  const defaultPackageName = `@hourglass-financial/${options.provider}`;
  const runtimeFixture = await Bun.file(
    path.join(
      options.rootDir,
      `scripts/fixtures/effect-consumer/${options.provider}.runtime.mjs`,
    ),
  ).text();
  await writeFile(
    path.join(options.tempDir, "runtime.mjs"),
    runtimeFixture.replaceAll(defaultPackageName, options.packageName),
  );
  let fixture = await Bun.file(
    path.join(
      options.rootDir,
      `scripts/fixtures/effect-consumer/${options.provider}.ts`,
    ),
  ).text();
  fixture = fixture.replaceAll(defaultPackageName, options.packageName);
  await writeFile(path.join(options.tempDir, "index.ts"), fixture);
};

export const runPrivatePackageSmoke = async (
  options: PrivatePackageSmokeOptions,
  sourceEnv: NodeJS.ProcessEnv = process.env,
): Promise<PrivatePackageSmokeResult> => {
  assertGitHubPackagesRegistry(GITHUB_PACKAGES_REGISTRY);
  const rootDir = path.resolve(options.rootDir ?? process.cwd());
  const policy = await readEffectCompatibilityPolicy(rootDir);
  const token = options.dryRun
    ? "dry-run-token"
    : resolveGitHubPackagesReadToken(sourceEnv);
  const tempDir = await mkdtemp(
    path.join(os.tmpdir(), `${options.provider}-package-smoke-`),
  );
  let succeeded = false;

  try {
    const environments = buildSmokeEnvironments({
      sourceEnv,
      tempDir,
      token,
    });
    await prepareSmokeProject({
      tempDir,
      rootDir,
      provider: options.provider,
      packageName: options.packageName,
      tag: options.tag,
      policy,
      npmrc: environments.npmrc,
    });

    if (options.dryRun) {
      succeeded = true;
      return { preserved: true, tempDir };
    }

    await runChecked(installCommand(options.packageManager), {
      cwd: tempDir,
      env: environments.installEnv,
    });
    await unlink(path.join(tempDir, ".npmrc"));
    await assertSingleEffectInstallation(
      path.join(tempDir, "node_modules"),
      policy.effectVersion,
    );
    await runChecked(
      ["node", "node_modules/typescript/bin/tsc", "-p", "tsconfig.json"],
      { cwd: tempDir, env: environments.runtimeEnv },
    );
    await runChecked(["node", "runtime.mjs"], {
      cwd: tempDir,
      env: environments.runtimeEnv,
    });
    succeeded = true;
    return options.keepTemp
      ? { preserved: true, tempDir }
      : { preserved: false };
  } finally {
    if (!succeeded || (!options.keepTemp && !options.dryRun)) {
      await rm(tempDir, { recursive: true, force: true });
    } else {
      await unlink(path.join(tempDir, ".npmrc")).catch(() => undefined);
    }
  }
};

export const parsePrivatePackageSmokeArgs = (
  defaults: Pick<
    PrivatePackageSmokeOptions,
    "provider" | "packageName" | "tag"
  >,
  argv: readonly string[],
): PrivatePackageSmokeOptions | "help" => {
  const { values } = parseArgs({
    args: [...argv],
    strict: true,
    allowPositionals: false,
    options: {
      package: { type: "string" },
      tag: { type: "string" },
      "package-manager": { type: "string", default: "bun" },
      "keep-temp": { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  if (values.help) return "help";
  const packageManager = values["package-manager"];
  if (packageManager !== "bun" && packageManager !== "npm") {
    throw new Error(`Unsupported package manager: ${packageManager}`);
  }
  return {
    ...defaults,
    packageName: values.package ?? defaults.packageName,
    tag: values.tag ?? defaults.tag,
    packageManager,
    keepTemp: values["keep-temp"] ?? false,
    dryRun: values["dry-run"] ?? false,
  };
};

export const runPrivatePackageSmokeCli = async (
  defaults: Pick<
    PrivatePackageSmokeOptions,
    "provider" | "packageName" | "tag"
  >,
  argv: readonly string[] = process.argv.slice(2),
): Promise<void> => {
  const options = parsePrivatePackageSmokeArgs(defaults, argv);
  if (options === "help") {
    console.log(
      `Usage: bun scripts/smoke-github-${defaults.provider}-install.ts [--package <name>] [--tag <tag>] [--package-manager <bun|npm>] [--keep-temp] [--dry-run]`,
    );
    return;
  }
  const result = await runPrivatePackageSmoke(options);
  if (result.preserved) console.log(`Smoke project: ${result.tempDir}`);
  else
    console.log(
      `${defaults.provider[0].toUpperCase()}${defaults.provider.slice(1)} package smoke passed`,
    );
};
