/**
 * The audit CLI end-to-end: real `bun` subprocess, fixture modules,
 * deterministic JSON on stdout, stubs on stderr, honest exit codes.
 */
import { spawnSync } from "node:child_process";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import type { AuditReport } from "../src/coverage/audit.ts";

const packageRoot = path.resolve(import.meta.dirname, "..");

const runCli = (
  args: readonly string[],
): { status: number | null; stdout: string; stderr: string } => {
  const result = spawnSync("bun", ["src/coverage/cli.ts", ...args], {
    cwd: packageRoot,
    encoding: "utf8",
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
};

const cleanArgs = [
  "--vendor",
  "workos",
  "--registry",
  "test/fixtures/registry.ts",
  "--manifest",
  "test/fixtures/coverage-clean.ts",
] as const;

describe("coverage audit CLI", () => {
  it("exits 0 with a deterministic JSON report for a clean manifest", () => {
    const first = runCli(cleanArgs);
    expect(first.status).toBe(0);
    const report = JSON.parse(first.stdout) as AuditReport;
    expect(report.ok).toBe(true);
    expect(report.vendor).toBe("workos");
    expect(report.operations).toBe(4);
    expect(report.counts.live).toEqual({
      tested: 1,
      todo: 2,
      skip: 1,
      untestable: 0,
    });
    // Byte-for-byte determinism across invocations.
    const second = runCli(cleanArgs);
    expect(second.stdout).toBe(first.stdout);
  });

  it("exits 1 on drift, reporting both directions and printing stubs to stderr", () => {
    const result = runCli([
      "--vendor",
      "workos",
      "--registry",
      "test/fixtures/registry.ts",
      "--manifest",
      "test/fixtures/coverage-drifted.ts",
    ]);
    expect(result.status).toBe(1);
    const report = JSON.parse(result.stdout) as AuditReport;
    expect(report.ok).toBe(false);
    expect(report.findings.map((finding) => finding.kind)).toEqual([
      "missing-entry",
      "stale-entry",
    ]);
    expect(report.findings[0]!.key).toBe("organizations.list");
    expect(report.findings[1]!.key).toBe("organizations.update");
    // Paste-ready stub, in the JSON and on stderr — never written to disk.
    expect(report.stubs).toContain(`"organizations.list": {`);
    expect(result.stderr).toContain(`"organizations.list": {`);
    expect(result.stderr).toContain('contract: "todo"');
  });

  it("exits 2 on usage errors", () => {
    expect(runCli(["--vendor", "workos"]).status).toBe(2);
    expect(
      runCli([
        "--vendor",
        "workos",
        "--registry",
        "test/fixtures/does-not-exist.ts",
        "--manifest",
        "test/fixtures/coverage-clean.ts",
      ]).status,
    ).toBe(2);
  });
});
