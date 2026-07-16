import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";

import { assertSingleEffectInstallation } from "./installed-effect.ts";

let tempDir: string | undefined;
afterEach(async () => {
  if (tempDir) await rm(tempDir, { recursive: true, force: true });
  tempDir = undefined;
});

const writeEffect = async (
  directory: string,
  version: string,
): Promise<void> => {
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, "package.json"),
    `${JSON.stringify({ name: "effect", version })}\n`,
  );
};

describe("installed Effect topology", () => {
  test("requires one physical installation at the requested version", async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "installed-effect-"));
    const nodeModules = path.join(tempDir, "node_modules");
    await writeEffect(path.join(nodeModules, "effect"), "4.0.0-beta.98");
    await expect(
      assertSingleEffectInstallation(nodeModules, "4.0.0-beta.98"),
    ).resolves.toBeUndefined();

    await writeEffect(
      path.join(nodeModules, "provider", "node_modules", "effect"),
      "4.0.0-beta.97",
    );
    await expect(
      assertSingleEffectInstallation(nodeModules, "4.0.0-beta.98"),
    ).rejects.toThrow("found 4.0.0-beta.98");
  });
});
