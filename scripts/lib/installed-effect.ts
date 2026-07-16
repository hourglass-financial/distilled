import { readdir, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";

export const findPhysicalEffectInstallations = async (
  nodeModules: string,
): Promise<Map<string, string>> => {
  const visitedDirectories = new Set<string>();
  const installations = new Map<string, string>();

  const walk = async (directory: string): Promise<void> => {
    const physicalDirectory = await realpath(directory).catch(() => undefined);
    if (!physicalDirectory || visitedDirectories.has(physicalDirectory)) return;
    const info = await stat(physicalDirectory).catch(() => undefined);
    if (!info?.isDirectory()) return;
    visitedDirectories.add(physicalDirectory);

    const entries = await readdir(physicalDirectory, { withFileTypes: true });
    for (const entry of entries) {
      const child = path.join(physicalDirectory, entry.name);
      if (
        entry.name === "effect" &&
        path.basename(physicalDirectory) === "node_modules"
      ) {
        const packageRoot = await realpath(child);
        const manifest = JSON.parse(
          await readFile(path.join(packageRoot, "package.json"), "utf8"),
        ) as { readonly version?: string };
        if (!manifest.version) {
          throw new Error(`Missing Effect version at ${packageRoot}`);
        }
        installations.set(packageRoot, manifest.version);
      }
      if (entry.isDirectory() || entry.isSymbolicLink()) await walk(child);
    }
  };

  await walk(nodeModules);
  return installations;
};

export const assertSingleEffectInstallation = async (
  nodeModules: string,
  expectedVersion: string,
): Promise<void> => {
  const installations = await findPhysicalEffectInstallations(nodeModules);
  const versions = [...installations.values()];
  if (installations.size !== 1 || versions[0] !== expectedVersion) {
    throw new Error(
      `Expected one physical Effect installation (${expectedVersion}); found ${[...installations.entries()].map(([directory, version]) => `${version} at ${directory}`).join(", ") || "none"}`,
    );
  }
};
