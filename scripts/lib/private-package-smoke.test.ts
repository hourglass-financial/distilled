import { describe, expect, test } from "vitest";

import {
  assertGitHubPackagesRegistry,
  buildSmokeEnvironments,
  parsePrivatePackageSmokeArgs,
  resolveGitHubPackagesReadToken,
} from "./private-package-smoke.ts";

describe("private package smoke security", () => {
  test("accepts only the canonical authenticated registry", () => {
    expect(assertGitHubPackagesRegistry("https://npm.pkg.github.com")).toBe(
      "https://npm.pkg.github.com",
    );
    for (const registry of [
      "http://npm.pkg.github.com",
      "https://npm.pkg.github.com.evil.example",
      "https://npm.pkg.github.com/path",
      "https://user@npm.pkg.github.com",
    ]) {
      expect(() => assertGitHubPackagesRegistry(registry)).toThrow();
    }
  });

  test("does not accept GH_TOKEN or local GITHUB_TOKEN implicitly", () => {
    expect(() =>
      resolveGitHubPackagesReadToken({ GH_TOKEN: "secret" }),
    ).toThrow();
    expect(() =>
      resolveGitHubPackagesReadToken({ GITHUB_TOKEN: "secret" }),
    ).toThrow();
    expect(
      resolveGitHubPackagesReadToken({
        GITHUB_ACTIONS: "true",
        GITHUB_TOKEN: "actions-token",
      }),
    ).toBe("actions-token");
  });

  test("keeps credentials out of typecheck and runtime environments", () => {
    const environments = buildSmokeEnvironments({
      sourceEnv: {
        PATH: "/bin",
        PERSONA_API_KEY: "persona-secret",
        EREBOR_API_KEY: "erebor-secret",
        WORKOS_API_KEY: "workos-secret",
        AWS_SECRET_ACCESS_KEY: "aws-secret",
      },
      tempDir: "/tmp/private-package-smoke",
      token: "package-token",
    });
    expect(environments.installEnv.NODE_AUTH_TOKEN).toBe("package-token");
    expect(environments.runtimeEnv.NODE_AUTH_TOKEN).toBeUndefined();
    expect(environments.installEnv.PERSONA_API_KEY).toBeUndefined();
    expect(environments.runtimeEnv.EREBOR_API_KEY).toBeUndefined();
    expect(environments.installEnv.WORKOS_API_KEY).toBeUndefined();
    expect(environments.runtimeEnv.WORKOS_API_KEY).toBeUndefined();
    expect(environments.npmrc).toContain("${NODE_AUTH_TOKEN}");
    expect(environments.npmrc).not.toContain("package-token");
  });

  test("parses the shared provider CLI consistently", () => {
    expect(
      parsePrivatePackageSmokeArgs(
        {
          provider: "persona",
          packageName: "@hourglass-financial/persona",
          tag: "persona-sdk",
        },
        ["--package-manager", "npm", "--tag", "exact-version", "--keep-temp"],
      ),
    ).toMatchObject({
      provider: "persona",
      packageManager: "npm",
      tag: "exact-version",
      keepTemp: true,
    });
  });
});
