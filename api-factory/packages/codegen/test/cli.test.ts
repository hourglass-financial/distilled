import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { describe, expect, it } from "vitest";
import { decodeIr, dumpIr } from "../src/index.ts";
import { minimalFixture } from "./fixtures/minimal.ts";
import { packageRoot } from "./helpers.ts";

const spawn = (args: ReadonlyArray<string>): SpawnSyncReturns<string> =>
  spawnSync("bun", ["run", "src/cli.ts", ...args], {
    cwd: packageRoot,
    encoding: "utf8",
  });

const setup = (): { readonly dir: string; readonly irPath: string } => {
  const dir = mkdtempSync(join(tmpdir(), "api-factory-codegen-cli-"));
  const irPath = join(dir, "ir.json");
  writeFileSync(irPath, dumpIr(minimalFixture));
  return { dir, irPath };
};

describe("codegen CLI", () => {
  it("generates a complete tree", () => {
    const { dir, irPath } = setup();
    try {
      const out = join(dir, "out");
      const result = spawn(["generate", "--ir", irPath, "--out", out]);
      expect(result.status, result.stderr).toBe(0);
      expect(readFileSync(join(out, "MANIFEST"), "utf8")).toContain(
        '"generator": "@hourglass-financial/api-factory-codegen"',
      );
      expect(readFileSync(join(out, "src", "registry.ts"), "utf8")).toContain(
        '"widgets.get"',
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("emits stable canonical IR that round-trips through decodeIr", () => {
    const { dir, irPath } = setup();
    try {
      const first = spawn(["--emit-ir", "--ir", irPath]);
      const second = spawn(["--emit-ir", "--ir", irPath]);
      expect(first.status, first.stderr).toBe(0);
      expect(first.stdout).toBe(second.stdout);
      expect(() => decodeIr(JSON.parse(first.stdout))).not.toThrow();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("verifies green and reports a changed file with exit 2", () => {
    const { dir, irPath } = setup();
    try {
      const out = join(dir, "out");
      expect(spawn(["generate", "--ir", irPath, "--out", out]).status).toBe(0);
      const green = spawn(["verify", "--ir", irPath, "--against", out]);
      expect(green.status, green.stderr).toBe(0);
      const changedPath = join(out, "src", "schemas.ts");
      writeFileSync(changedPath, `${readFileSync(changedPath, "utf8")} `);
      const changed = spawn(["verify", "--ir", irPath, "--against", out]);
      expect(changed.status).toBe(2);
      expect(changed.stderr).toContain("changed src/schemas.ts");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("returns exit 1 for missing and malformed arguments", () => {
    const missing = spawn(["generate", "--ir"]);
    expect(missing.status).toBe(1);
    expect(missing.stderr).toContain("cli.arguments");
    const malformed = spawn(["not-a-command"]);
    expect(malformed.status).toBe(1);
    expect(malformed.stderr).toContain("usage:");
  });
});
