/**
 * The coverage audit: universe drift both directions, canonical order,
 * malformed entries, deterministic JSON, paste-ready stubs — and never a
 * coverage floor.
 */
import { describe, expect, it } from "vitest";
import { auditCoverage, renderStub } from "../src/coverage/audit.ts";
import type { CoverageManifest } from "../src/coverage/manifest.ts";

const registry = [
  "organizations.create",
  "organizations.delete",
  "organizations.get",
  "organizations.list",
  "userManagement.authenticateWithPassword",
] as const;

const clean: CoverageManifest = {
  "organizations.create": { contract: "tested", live: "tested" },
  "organizations.delete": { contract: "tested", live: "todo" },
  "organizations.get": { contract: "todo", live: "todo" },
  "organizations.list": {
    contract: { status: "skip", reason: "covered by listItems contract suite" },
    live: "tested",
  },
  "userManagement.authenticateWithPassword": {
    contract: "tested",
    live: {
      status: "untestable",
      reason: "needs a real SCIM-pushing IdP",
      ref: "https://github.com/hourglass-financial/distilled/issues/30",
    },
  },
};

const audit = (manifest: unknown) =>
  auditCoverage({ vendor: "workos", registry: [...registry], manifest });

describe("auditCoverage", () => {
  it("a clean manifest audits ok with per-lane counts", () => {
    const report = audit(clean);
    expect(report.ok).toBe(true);
    expect(report.findings).toEqual([]);
    expect(report.operations).toBe(5);
    expect(report.counts).toEqual({
      contract: { tested: 3, todo: 1, skip: 1 },
      live: { tested: 2, todo: 2, skip: 0, untestable: 1 },
    });
    expect(report.stubs).toBe("");
  });

  it("a new registry op with no entry hard-fails and prints a paste-ready stub", () => {
    const { "organizations.delete": _dropped, ...partial } = clean;
    const report = audit(partial);
    expect(report.ok).toBe(false);
    expect(report.findings).toEqual([
      {
        kind: "missing-entry",
        key: "organizations.delete",
        message: `operation "organizations.delete" has no manifest entry`,
      },
    ]);
    expect(report.stubs).toBe(renderStub("organizations.delete"));
    expect(report.stubs).toContain(`"organizations.delete": {`);
    expect(report.stubs).toContain(`contract: "todo"`);
    expect(report.stubs).toContain(`live: "todo"`);
  });

  it("a stale entry for a removed op hard-fails naming the key", () => {
    const report = audit({
      ...clean,
      "organizations.update": { contract: "todo", live: "todo" },
    });
    expect(report.ok).toBe(false);
    expect(report.findings).toEqual([
      {
        kind: "stale-entry",
        key: "organizations.update",
        message: `manifest entry "organizations.update" matches no operation in the registry`,
      },
    ]);
  });

  it("keys out of canonical (registry) order are a finding", () => {
    const { "organizations.create": first, ...rest } = clean;
    const reordered = { ...rest, "organizations.create": first };
    const report = audit(reordered);
    expect(report.ok).toBe(false);
    expect(report.findings.map((finding) => finding.kind)).toEqual([
      "out-of-order",
    ]);
    expect(report.findings[0]!.key).toBe("organizations.delete");
  });

  it("reason-less skip/untestable and unknown statuses are malformed entries", () => {
    const report = audit({
      ...clean,
      "organizations.get": {
        contract: "skip",
        live: { status: "untestable", reason: "  " },
      },
      "organizations.list": { contract: "tested", live: "maybe", extra: 1 },
    });
    expect(report.ok).toBe(false);
    const kinds = report.findings.map((finding) => finding.kind);
    expect(new Set(kinds)).toEqual(new Set(["malformed-entry"]));
    const messages = report.findings
      .map((finding) => finding.message)
      .join("\n");
    expect(messages).toContain('bare status "skip" is not allowed');
    expect(messages).toContain('"untestable" requires a non-empty reason');
    expect(messages).toContain('unknown field "extra"');
    expect(messages).toContain('bare status "maybe" is not allowed');
  });

  it("a non-object manifest fails closed", () => {
    const report = audit(["not", "a", "manifest"]);
    expect(report.ok).toBe(false);
    expect(report.findings.some((f) => f.kind === "malformed-entry")).toBe(
      true,
    );
    // Every registry op is then missing — stubs for all of them.
    expect(
      report.findings.filter((f) => f.kind === "missing-entry"),
    ).toHaveLength(5);
  });

  it("a duplicated registry key is an invalid-registry finding", () => {
    const report = auditCoverage({
      vendor: "workos",
      registry: [...registry, "organizations.create"],
      manifest: clean,
    });
    expect(report.ok).toBe(false);
    expect(report.findings[0]).toMatchObject({
      kind: "invalid-registry",
      key: "organizations.create",
    });
  });

  it("is deterministic: identical inputs serialize identically", () => {
    const dirty = {
      ...clean,
      "organizations.update": { contract: "todo", live: "bogus" },
    };
    const first = JSON.stringify(audit(dirty));
    const second = JSON.stringify(audit(dirty));
    expect(first).toBe(second);
  });

  it("never enforces floors: an all-todo manifest with no drift is ok", () => {
    const allTodo = Object.fromEntries(
      registry.map((key) => [key, { contract: "todo", live: "todo" }]),
    );
    const report = audit(allTodo);
    expect(report.ok).toBe(true);
    expect(report.counts.contract.todo).toBe(5);
  });
});
