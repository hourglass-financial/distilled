import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";

import {
  applyEffectPackagePolicy,
  assertSourceEffectPackagePolicy,
  readEffectCompatibilityPolicy,
  type EffectCompatibilityPolicy,
} from "./effect-package-policy.ts";

const policy: EffectCompatibilityPolicy = {
  typescriptVersion: "7.0.2",
  effectVersion: "4.0.0-beta.98",
};

let tempDir: string | undefined;
afterEach(async () => {
  if (tempDir) await rm(tempDir, { recursive: true, force: true });
  tempDir = undefined;
});

describe("private Effect package policy", () => {
  test("rejects direct Effect ownership", () => {
    expect(() =>
      applyEffectPackagePolicy(
        {
          dependencies: { effect: "4.0.0-beta.98" },
          peerDependencies: { effect: "4.0.0-beta.98" },
        },
        "@hourglass-financial/persona",
        policy,
      ),
    ).toThrow("consumer-supplied");
  });

  test("applies the same verified peer contract to staged packages", () => {
    expect(
      applyEffectPackagePolicy(
        { peerDependencies: { effect: "catalog:" } },
        "@hourglass-financial/distilled-core",
        policy,
      ),
    ).toEqual({ peerDependencies: { effect: "4.0.0-beta.98" } });
  });

  test("rejects source peer drift before staging", () => {
    expect(() =>
      assertSourceEffectPackagePolicy(
        { peerDependencies: { effect: "4.0.0-beta.97" } },
        "@distilled.cloud/persona",
        policy,
        { allowCatalogPeer: false },
      ),
    ).toThrow("does not match verified policy");
  });

  test("rejects a prerelease range", async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "effect-policy-"));
    await mkdir(path.join(tempDir, "scripts"));
    await writeFile(
      path.join(tempDir, "scripts/effect-compatibility-versions.json"),
      JSON.stringify({
        typescriptVersion: "7.0.2",
        effectVersion: ">=4.0.0-beta.98",
      }),
    );
    await expect(readEffectCompatibilityPolicy(tempDir)).rejects.toThrow(
      "exact Effect 4 prerelease",
    );
  });
});
