#!/usr/bin/env bun

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

interface PackMetadata {
  readonly name: string;
  readonly version: string;
  readonly filename: string;
  readonly integrity: string;
  readonly shasum: string;
}

export interface ReleasePackageReceipt {
  readonly name: string;
  readonly version: string;
  readonly localIntegrity: string;
  readonly registryIntegrity: string;
  readonly shasum: string;
  readonly libDigest: string;
  readonly finalTag: string;
}

export interface ReleaseReceipt {
  readonly schemaVersion: 1;
  readonly repository: string;
  readonly workflow: string;
  readonly workflowSha: string;
  readonly run: {
    readonly id: string;
    readonly attempt: string;
    readonly url: string;
  };
  readonly source: {
    readonly requestedSha: string;
    readonly checkedOutSha: string;
    readonly reachableFromMain: true;
  };
  readonly distTag: string;
  readonly packages: readonly ReleasePackageReceipt[];
}

const run = (
  command: readonly [string, ...string[]],
  options: { readonly cwd?: string; readonly env?: NodeJS.ProcessEnv } = {},
): Promise<string> =>
  new Promise((resolve, reject) => {
    const child = spawn(command[0], command.slice(1), {
      cwd: options.cwd,
      env: options.env ?? process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += String(chunk)));
    child.stderr.on("data", (chunk) => (stderr += String(chunk)));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(stdout.trim());
      else
        reject(new Error(`${command.join(" ")} failed (${code})\n${stderr}`));
    });
  });

export const assertFullSourceSha = (sha: string): string => {
  if (!/^[0-9a-f]{40}$/i.test(sha)) {
    throw new Error("source-sha must be a full 40-character Git commit SHA");
  }
  return sha.toLowerCase();
};

export const assertDistTag = (tag: string): string => {
  if (
    tag.length > 214 ||
    !/^[a-z][a-z0-9._-]*$/.test(tag) ||
    /^\d+\.\d+\.\d+/.test(tag)
  ) {
    throw new Error(
      "dist-tag must be a non-version npm tag using lowercase safe characters",
    );
  }
  return tag;
};

const assertPrivatePackageName = (packageName: string): string => {
  if (!/^@hourglass-financial\/[a-z0-9._-]+$/.test(packageName)) {
    throw new Error("package must be in the @hourglass-financial scope");
  }
  return packageName;
};

export const parseDistTagListing = (listing: string, tag: string): string => {
  const prefix = `${assertDistTag(tag)}: `;
  const line = listing
    .split(/\r?\n/)
    .find((candidate) => candidate.startsWith(prefix));
  return line?.slice(prefix.length).trim() ?? "";
};

export const digestLibDirectory = async (
  packageDir: string,
): Promise<string> => {
  const libDir = path.join(packageDir, "lib");
  const entries = await readdir(libDir, {
    recursive: true,
    withFileTypes: true,
  });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort((left, right) => left.localeCompare(right));
  const hash = createHash("sha256");
  for (const file of files) {
    const relative = path.relative(libDir, file).split(path.sep).join("/");
    hash.update(relative);
    hash.update("\0");
    hash.update(await readFile(file));
    hash.update("\0");
  }
  return `sha256-${hash.digest("hex")}`;
};

const readPackMetadata = async (file: string): Promise<PackMetadata> => {
  const parsed = JSON.parse(await readFile(file, "utf8")) as PackMetadata[];
  const metadata = parsed[0];
  if (
    !metadata?.name ||
    !metadata.version ||
    !metadata.integrity ||
    !metadata.shasum
  ) {
    throw new Error(`Invalid npm pack metadata: ${file}`);
  }
  return metadata;
};

export const pollForExpectedValue = async (
  read: () => Promise<string>,
  expected: string,
  options: {
    readonly attempts?: number;
    readonly delayMs?: number;
    readonly description?: string;
  } = {},
): Promise<string> => {
  const attempts = options.attempts ?? 10;
  const delayMs = options.delayMs ?? 3_000;
  let lastResult: string | undefined;
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      lastResult = await read();
      if (lastResult === expected) return lastResult;
      lastError = undefined;
    } catch (error) {
      lastError = error;
    }
    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  if (lastError) throw lastError;
  throw new Error(
    `${options.description ?? "registry value"} did not resolve to ${expected}; last observed ${lastResult ?? "<none>"}`,
  );
};

const npmViewExpected = async (
  specifier: string,
  field: string,
  expected: string,
): Promise<string> => {
  return pollForExpectedValue(
    async () => {
      const output = await run([
        "npm",
        "view",
        specifier,
        field,
        "--json",
        "--registry=https://npm.pkg.github.com",
      ]);
      return JSON.parse(output) as string;
    },
    expected,
    { description: `${specifier} ${field}` },
  );
};

export const verifyPublishedTag = (
  packageName: string,
  tag: string,
  version: string,
): Promise<string> =>
  npmViewExpected(
    `${assertPrivatePackageName(packageName)}@${assertDistTag(tag)}`,
    "version",
    version,
  );

export const createReleaseReceipt = (options: {
  readonly repository: string;
  readonly workflow: string;
  readonly workflowSha: string;
  readonly runId: string;
  readonly runAttempt: string;
  readonly runUrl: string;
  readonly sourceSha: string;
  readonly checkedOutSha: string;
  readonly distTag: string;
  readonly packages: readonly ReleasePackageReceipt[];
}): ReleaseReceipt => ({
  schemaVersion: 1,
  repository: options.repository,
  workflow: options.workflow,
  workflowSha: options.workflowSha,
  run: {
    id: options.runId,
    attempt: options.runAttempt,
    url: options.runUrl,
  },
  source: {
    requestedSha: options.sourceSha,
    checkedOutSha: options.checkedOutSha,
    reachableFromMain: true,
  },
  distTag: options.distTag,
  packages: options.packages,
});

const verifyPair = async (options: {
  readonly corePack: string;
  readonly providerPack: string;
  readonly coreDir: string;
  readonly providerDir: string;
  readonly tag: string;
}): Promise<ReleasePackageReceipt[]> => {
  assertDistTag(options.tag);
  const core = await readPackMetadata(options.corePack);
  const provider = await readPackMetadata(options.providerPack);
  const providerManifest = JSON.parse(
    await readFile(path.join(options.providerDir, "package.json"), "utf8"),
  ) as { readonly dependencies?: Record<string, string> };
  const expectedCore = `npm:${core.name}@${core.version}`;
  if (
    providerManifest.dependencies?.["@distilled.cloud/core"] !== expectedCore
  ) {
    throw new Error(
      `Provider does not reference matching private core ${expectedCore}`,
    );
  }

  const packages = await Promise.all(
    [
      { metadata: core, directory: options.coreDir },
      { metadata: provider, directory: options.providerDir },
    ].map(async ({ metadata, directory }) => {
      const registryIntegrity = await npmViewExpected(
        `${metadata.name}@${metadata.version}`,
        "dist.integrity",
        metadata.integrity,
      );
      await npmViewExpected(
        `${metadata.name}@${options.tag}`,
        "version",
        metadata.version,
      );
      return {
        name: metadata.name,
        version: metadata.version,
        localIntegrity: metadata.integrity,
        registryIntegrity,
        shasum: metadata.shasum,
        libDigest: await digestLibDirectory(directory),
        finalTag: options.tag,
      };
    }),
  );
  return packages;
};

const argument = (name: string): string => {
  const index = process.argv.indexOf(name);
  const value = process.argv[index + 1];
  if (index < 0 || !value) throw new Error(`Missing ${name}`);
  return value;
};

if (import.meta.main) {
  try {
    const command = process.argv[2];
    if (command === "tag-version") {
      const packageName = assertPrivatePackageName(argument("--package"));
      const tag = assertDistTag(argument("--tag"));
      const listing = await run([
        "npm",
        "dist-tag",
        "ls",
        packageName,
        "--registry=https://npm.pkg.github.com",
      ]);
      console.log(parseDistTagListing(listing, tag));
    } else if (command === "verify-tag") {
      await verifyPublishedTag(
        argument("--package"),
        argument("--tag"),
        argument("--version"),
      );
    } else if (command === "verify" || command === "receipt") {
      const tag = argument("--tag");
      const packages = await verifyPair({
        corePack: argument("--core-pack"),
        providerPack: argument("--provider-pack"),
        coreDir: argument("--core-dir"),
        providerDir: argument("--provider-dir"),
        tag,
      });
      if (command === "receipt") {
        const sourceSha = assertFullSourceSha(argument("--source-sha"));
        const checkedOutSha = await run(["git", "rev-parse", "HEAD"]);
        if (checkedOutSha.toLowerCase() !== sourceSha) {
          throw new Error(
            `Receipt source ${sourceSha} does not match checked out ${checkedOutSha}`,
          );
        }
        const repository =
          process.env.GITHUB_REPOSITORY ?? "hourglass-financial/distilled";
        const serverUrl = process.env.GITHUB_SERVER_URL ?? "https://github.com";
        const receipt = createReleaseReceipt({
          repository,
          workflow: process.env.GITHUB_WORKFLOW ?? "private-package-release",
          workflowSha: process.env.GITHUB_SHA ?? sourceSha,
          runId: process.env.GITHUB_RUN_ID ?? "local",
          runAttempt: process.env.GITHUB_RUN_ATTEMPT ?? "1",
          runUrl: `${serverUrl}/${repository}/actions/runs/${process.env.GITHUB_RUN_ID ?? "local"}`,
          sourceSha,
          checkedOutSha,
          distTag: tag,
          packages,
        });
        await writeFile(
          argument("--output"),
          `${JSON.stringify(receipt, null, 2)}\n`,
        );
      }
    } else {
      throw new Error(
        "Expected tag-version, verify-tag, verify, or receipt command",
      );
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
