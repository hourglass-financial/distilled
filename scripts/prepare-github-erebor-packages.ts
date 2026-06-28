#!/usr/bin/env bun

import {
  cp,
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

const GITHUB_REGISTRY = "https://npm.pkg.github.com";
const ORG_SCOPE = "@hourglass-financial";
const DISTILLED_CORE_NAME = "@distilled.cloud/core";
const PRIVATE_CORE_NAME = `${ORG_SCOPE}/distilled-core`;
const PRIVATE_EREBOR_NAME = `${ORG_SCOPE}/erebor`;

type JsonObject = Record<string, unknown>;

interface PrepareOptions {
  readonly rootDir?: string;
  readonly stageDir: string;
  readonly version: string;
  readonly force: boolean;
}

interface PreparedPackage {
  readonly name: string;
  readonly directory: string;
  readonly manifest: JsonObject;
}

interface SourcePackage {
  readonly sourceName: string;
  readonly privateName: string;
  readonly directory: string;
}

const sourcePackages: readonly SourcePackage[] = [
  {
    sourceName: DISTILLED_CORE_NAME,
    privateName: PRIVATE_CORE_NAME,
    directory: "packages/core",
  },
  {
    sourceName: "@distilled.cloud/erebor",
    privateName: PRIVATE_EREBOR_NAME,
    directory: "packages/erebor",
  },
];

const readJson = async <T>(file: string): Promise<T> =>
  JSON.parse(await readFile(file, "utf8")) as T;

const writeJson = async (file: string, value: unknown): Promise<void> => {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
};

const assertDirectory = async (dir: string, label: string): Promise<void> => {
  try {
    const info = await stat(dir);
    if (!info.isDirectory()) {
      throw new Error(`${label} exists but is not a directory: ${dir}`);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`${label} is missing. Build the package first: ${dir}`);
    }
    throw error;
  }
};

// tsconfig `paths` aliases (e.g. `~/*`) resolve only in-repo. If they leak into
// emitted declarations they ship as unresolvable imports — TS silently degrades
// the referenced types to `any` under skipLibCheck, or errors under
// skipLibCheck:false. Fail the publish before that artifact escapes.
const PATH_ALIAS_IMPORT = /(?:from\s*|import\s*\(\s*)["']~\//;

const collectFiles = async (
  dir: string,
  predicate: (file: string) => boolean,
): Promise<string[]> => {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && predicate(entry.name))
    .map((entry) => path.join(entry.parentPath, entry.name));
};

const assertNoPathAliasImports = async (
  libDir: string,
  packageName: string,
): Promise<void> => {
  const declarationFiles = await collectFiles(
    libDir,
    (file) => file.endsWith(".d.ts") || file.endsWith(".d.ts.map"),
  );

  const offenders: string[] = [];
  for (const file of declarationFiles) {
    const contents = await readFile(file, "utf8");
    if (PATH_ALIAS_IMPORT.test(contents)) {
      offenders.push(path.relative(libDir, file));
    }
  }

  if (offenders.length > 0) {
    throw new Error(
      `${packageName}: ${offenders.length} declaration file(s) reference an unresolvable ` +
        `"~/" path alias and would ship broken types. Remove the "paths" entry from the ` +
        `package tsconfig (so tsgo emits relative imports) and rebuild.\n` +
        offenders.map((file) => `  - lib/${file}`).join("\n"),
    );
  }
};

const resolveCatalogSpecifier = (
  specifier: unknown,
  rootManifest: JsonObject,
): string | undefined => {
  if (typeof specifier !== "string") return undefined;
  if (!specifier.startsWith("catalog:")) return specifier;

  const catalog = (rootManifest.workspaces as JsonObject | undefined)?.catalog;
  if (!catalog || typeof catalog !== "object") {
    throw new Error(
      "Cannot resolve catalog dependency without root workspaces.catalog",
    );
  }

  const key = specifier.slice("catalog:".length);
  if (key) {
    const keyed = (catalog as Record<string, unknown>)[key];
    if (typeof keyed === "string") return keyed;
  }

  return undefined;
};

const resolveDependencyMap = (
  dependencies: unknown,
  rootManifest: JsonObject,
  overrides: Record<string, (version: string) => string>,
  version: string,
): Record<string, string> | undefined => {
  if (!dependencies || typeof dependencies !== "object") return undefined;

  const resolved: Record<string, string> = {};
  for (const [name, rawSpecifier] of Object.entries(
    dependencies as Record<string, unknown>,
  )) {
    const override = overrides[name]?.(version);
    if (override) {
      resolved[name] = override;
      continue;
    }

    const specifier = resolveCatalogSpecifier(rawSpecifier, rootManifest);
    if (!specifier) {
      const rootCatalog = (rootManifest.workspaces as JsonObject | undefined)
        ?.catalog as Record<string, unknown> | undefined;
      const catalogSpecifier = rootCatalog?.[name];
      if (typeof catalogSpecifier === "string") {
        resolved[name] = catalogSpecifier;
        continue;
      }
    }

    if (!specifier || specifier.startsWith("workspace:")) {
      throw new Error(
        `Cannot publish unresolved dependency ${name}: ${rawSpecifier}`,
      );
    }

    resolved[name] = specifier;
  }

  return Object.keys(resolved).length > 0 ? resolved : undefined;
};

const resolvePeerDependencyMap = (
  peerDependencies: unknown,
  rootManifest: JsonObject,
): Record<string, string> | undefined =>
  resolveDependencyMap(peerDependencies, rootManifest, {}, "0.0.0");

const runtimeExports = (exportsValue: unknown): JsonObject | undefined => {
  if (!exportsValue || typeof exportsValue !== "object") return undefined;

  const next: JsonObject = {};
  for (const [key, value] of Object.entries(exportsValue as JsonObject)) {
    if (!value || typeof value !== "object") continue;

    const exportObject = value as JsonObject;
    if (
      typeof exportObject.default === "string" &&
      exportObject.default.startsWith("./lib/")
    ) {
      next[key] = {
        ...(typeof exportObject.types === "string"
          ? { types: exportObject.types }
          : {}),
        default: exportObject.default,
      };
    }
  }

  return Object.keys(next).length > 0 ? next : undefined;
};

const privateReadme = (source: SourcePackage): string => {
  if (source.privateName === PRIVATE_CORE_NAME) {
    return [
      `# ${PRIVATE_CORE_NAME}`,
      "",
      "Private GitHub Packages build of Distilled core for Hourglass internal SDK consumption.",
      "",
      "This package is a transitive dependency of `@hourglass-financial/erebor`.",
      "",
    ].join("\n");
  }

  return [
    `# ${PRIVATE_EREBOR_NAME}`,
    "",
    "Private GitHub Packages build of the Erebor SDK for Hourglass internal repositories.",
    "",
    "## Installation",
    "",
    "```bash",
    `bun add ${PRIVATE_EREBOR_NAME}@erebor-sdk`,
    "```",
    "",
    "## Usage",
    "",
    "```typescript",
    `import { CredentialsFromEnv } from "${PRIVATE_EREBOR_NAME}";`,
    `import { listPrograms } from "${PRIVATE_EREBOR_NAME}/Operations";`,
    "```",
    "",
    "Set `EREBOR_API_KEY` in the consuming environment.",
    "",
  ].join("\n");
};

const dependencyOverridesFor = (
  source: SourcePackage,
): Record<string, (version: string) => string> =>
  source.privateName === PRIVATE_EREBOR_NAME
    ? {
        [DISTILLED_CORE_NAME]: (version) =>
          `npm:${PRIVATE_CORE_NAME}@${version}`,
      }
    : {};

const stagedManifest = (
  sourceManifest: JsonObject,
  rootManifest: JsonObject,
  source: SourcePackage,
  version: string,
): JsonObject => {
  const dependencies = resolveDependencyMap(
    sourceManifest.dependencies,
    rootManifest,
    dependencyOverridesFor(source),
    version,
  );
  const peerDependencies = resolvePeerDependencyMap(
    sourceManifest.peerDependencies,
    rootManifest,
  );
  const exportsValue = runtimeExports(sourceManifest.exports);

  if (!exportsValue) {
    throw new Error(`No lib-backed exports found for ${source.sourceName}`);
  }

  return {
    name: source.privateName,
    version,
    repository: {
      type: "git",
      url: "git+https://github.com/hourglass-financial/distilled.git",
      directory: source.directory,
    },
    type: sourceManifest.type ?? "module",
    sideEffects: sourceManifest.sideEffects ?? false,
    files: ["lib", "README.md"],
    exports: exportsValue,
    publishConfig: {
      registry: GITHUB_REGISTRY,
    },
    ...(dependencies ? { dependencies } : {}),
    ...(peerDependencies ? { peerDependencies } : {}),
  };
};

const isWithin = (parent: string, child: string): boolean => {
  const relative = path.relative(parent, child);
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  );
};

const assertSafeStageDir = (
  rootDir: string,
  stageDir: string,
  force: boolean,
): void => {
  const aiWorkspace = path.join(rootDir, ".ai-workspace");
  if (!force && !isWithin(aiWorkspace, stageDir)) {
    throw new Error(
      `Refusing to delete stage directory outside .ai-workspace: ${stageDir}. ` +
        "Pass --force if this is intentional.",
    );
  }
};

const prepareGithubEreborPackages = async (
  options: PrepareOptions,
): Promise<PreparedPackage[]> => {
  const rootDir = path.resolve(options.rootDir ?? process.cwd());
  const stageDir = path.resolve(rootDir, options.stageDir);
  const rootManifest = await readJson<JsonObject>(
    path.join(rootDir, "package.json"),
  );

  assertSafeStageDir(rootDir, stageDir, options.force);
  await rm(stageDir, { recursive: true, force: true });
  await mkdir(stageDir, { recursive: true });

  const prepared: PreparedPackage[] = [];
  for (const source of sourcePackages) {
    const packageDir = path.join(rootDir, source.directory);
    const libDir = path.join(packageDir, "lib");
    await assertDirectory(libDir, `${source.sourceName} build output`);

    const sourceManifest = await readJson<JsonObject>(
      path.join(packageDir, "package.json"),
    );
    const outputDir = path.join(
      stageDir,
      source.privateName.replace("/", "__"),
    );
    const manifest = stagedManifest(
      sourceManifest,
      rootManifest,
      source,
      options.version,
    );

    await mkdir(outputDir, { recursive: true });
    const stagedLibDir = path.join(outputDir, "lib");
    await cp(libDir, stagedLibDir, { recursive: true });
    await assertNoPathAliasImports(stagedLibDir, source.privateName);
    await writeFile(path.join(outputDir, "README.md"), privateReadme(source));
    await writeJson(path.join(outputDir, "package.json"), manifest);

    prepared.push({
      name: source.privateName,
      directory: outputDir,
      manifest,
    });
  }

  return prepared;
};

const usage = (): string =>
  [
    "Usage: bun scripts/prepare-github-erebor-packages.ts --version <version> --stage-dir <dir> [--force]",
    "",
    "Creates publish-ready package directories for @hourglass-financial/distilled-core",
    "and @hourglass-financial/erebor.",
    "",
    "By default, --stage-dir must be inside .ai-workspace because it is deleted before staging.",
  ].join("\n");

const parseArgs = (argv: readonly string[]): PrepareOptions => {
  let stageDir = ".ai-workspace/github-packages";
  let version: string | undefined;
  let force = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if ((arg === "--stage-dir" || arg === "--out") && next) {
      stageDir = next;
      i += 1;
    } else if (arg === "--version" && next) {
      version = next;
      i += 1;
    } else if (arg === "--force") {
      force = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else {
      throw new Error(`Unknown or incomplete argument: ${arg}\n\n${usage()}`);
    }
  }

  if (!version) {
    throw new Error(`Missing required --version\n\n${usage()}`);
  }

  return { stageDir, version, force };
};

if (import.meta.main) {
  try {
    const prepared = await prepareGithubEreborPackages(
      parseArgs(process.argv.slice(2)),
    );
    for (const pkg of prepared) {
      console.log(`${pkg.name} -> ${pkg.directory}`);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
