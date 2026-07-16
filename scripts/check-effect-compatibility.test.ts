import { describe, expect, test } from "vitest";
import { readFile } from "node:fs/promises";

import { readEffectCompatibilityPolicy } from "./lib/effect-package-policy.ts";

describe("Effect compatibility contract", () => {
  test("excludes the reproduced failing beta.97 floor", async () => {
    const policy = await readEffectCompatibilityPolicy(process.cwd());
    expect(policy.effectVersion).toBe("4.0.0-beta.98");
    expect(policy.effectVersion).not.toBe("4.0.0-beta.97");
  });

  test("strict fixtures keep library declaration checking enabled", async () => {
    const tsconfig = JSON.parse(
      await readFile("scripts/fixtures/effect-consumer/tsconfig.json", "utf8"),
    );
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.skipLibCheck).toBe(false);
  });

  test("fork-only providers use the workspace TypeScript compiler", async () => {
    for (const provider of ["persona", "erebor"]) {
      const manifest = JSON.parse(
        await readFile(`packages/${provider}/package.json`, "utf8"),
      );
      expect(manifest.scripts.typecheck).toBe("tsc");
      expect(manifest.scripts.build).toBe("tsc -b");
      expect(manifest.scripts.check).toContain("tsc &&");
    }
  });
});
