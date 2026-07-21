import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { afterAll, describe, expect, it } from "vitest";
import {
  acquire,
  auditAttestation,
  auditPatchLocalityFrom,
  buildVendorIr,
  diffSpecs,
  loadVendorDir,
  printJson,
  sha256,
  type Formatter,
  type JsonObject,
  type JsonValue,
} from "../src/index.ts";
import {
  northstarConfig,
  northstarSpec,
  patchEntry,
  writeVendorDir,
} from "./fixtures/openapi.ts";
import { packageRoot } from "./helpers.ts";

const identity: Formatter = (files) => files;

const temps: string[] = [];
const temp = (): string => {
  const dir = mkdtempSync(join(tmpdir(), "api-factory-vendor-test-"));
  temps.push(dir);
  return dir;
};
afterAll(() => {
  for (const dir of temps) rmSync(dir, { recursive: true, force: true });
});

const spawn = (args: ReadonlyArray<string>): SpawnSyncReturns<string> =>
  spawnSync("bun", ["run", "src/cli.ts", ...args], {
    cwd: packageRoot,
    encoding: "utf8",
  });

const conflictInjection = (over: JsonObject = {}): JsonValue =>
  patchEntry(
    "001-widget-get-conflict",
    {
      kind: "error-response-injection",
      operationPath: "/paths/~1widgets~1{id}/get",
      status: "409",
      response: { description: "The widget is locked by another request." },
      precondition: {
        pointer: "/paths/~1widgets~1{id}/get/responses/409",
        absent: true,
      },
    },
    over,
  );

describe("acquisition and attestation", () => {
  it("acquires a JSON source and passes the attestation audit until tampered", async () => {
    const dir = temp();
    const source = join(dir, "upstream.json");
    writeFileSync(source, JSON.stringify(northstarSpec));
    const vendorDir = join(dir, "vendor");
    const result = await acquire({
      vendorDir,
      source,
      upstreamRef: "v9.9.9",
      now: () => new Date("2026-07-20T12:00:00.000Z"),
    });
    expect(result.provenance.upstreamRef).toBe("v9.9.9");
    expect(result.provenance.fetchedAt).toBe("2026-07-20T12:00:00.000Z");
    expect(auditAttestation(vendorDir).ok).toBe(true);
    // The machine-locked snapshot is byte-verbatim for JSON sources — a
    // parse -> re-print round trip would silently corrupt the artifact.
    expect(readFileSync(join(vendorDir, "spec.json"), "utf8")).toBe(
      readFileSync(source, "utf8"),
    );

    const specPath = join(vendorDir, "spec.json");
    writeFileSync(
      specPath,
      readFileSync(specPath, "utf8").replace("3.1.0", "3.1.1"),
    );
    const tampered = auditAttestation(vendorDir);
    expect(tampered.ok).toBe(false);
    expect(tampered.actualHash).not.toBe(tampered.expectedHash);

    const audit = spawn(["audit-attestation", "--vendor", vendorDir]);
    expect(audit.status).toBe(2);
    expect(JSON.parse(audit.stdout)).toMatchObject({ ok: false });

    writeVendorDir(vendorDir, {
      spec: northstarSpec,
      config: northstarConfig,
    });
    writeFileSync(
      specPath,
      readFileSync(specPath, "utf8").replace("3.1.0", "3.1.1"),
    );
    expect(() => buildVendorIr(vendorDir)).toThrow(/attestation\.mismatch/u);
  });

  it("converts a YAML source to a JSON snapshot via the CLI", () => {
    const dir = temp();
    const source = join(dir, "upstream.yaml");
    writeFileSync(
      source,
      ["openapi: 3.1.0", "paths: {}", "info:", "  title: Yamlish"].join("\n"),
    );
    const vendorDir = join(dir, "vendor");
    const result = spawn([
      "acquire",
      "--vendor",
      vendorDir,
      "--source",
      source,
    ]);
    expect(result.status, result.stderr).toBe(0);
    const spec = JSON.parse(
      readFileSync(join(vendorDir, "spec.json"), "utf8"),
    ) as { openapi: string };
    expect(spec.openapi).toBe("3.1.0");
    const provenance = JSON.parse(
      readFileSync(join(vendorDir, "spec.provenance.json"), "utf8"),
    ) as { sourceFormat: string; sourceContentHash?: string };
    expect(provenance.sourceFormat).toBe("yaml");
    expect(provenance.sourceContentHash).toBeDefined();
    expect(auditAttestation(vendorDir).ok).toBe(true);
  });
});

describe("CLI --vendor", () => {
  it("generates from a vendor tree with full MANIFEST provenance and verifies green", () => {
    const dir = temp();
    const vendorDir = join(dir, "vendor");
    writeVendorDir(vendorDir, {
      spec: northstarSpec,
      config: northstarConfig,
    });
    const out = join(dir, "out");
    const generated = spawn(["generate", "--vendor", vendorDir, "--out", out]);
    expect(generated.status, generated.stderr).toBe(0);
    const manifest = JSON.parse(
      readFileSync(join(out, "MANIFEST"), "utf8"),
    ) as {
      provenance: Record<string, string>;
    };
    expect(manifest.provenance["specHash"]).toBe(
      sha256(readFileSync(join(vendorDir, "spec.json"), "utf8")),
    );
    expect(manifest.provenance["configHash"]).toBe(
      sha256(readFileSync(join(vendorDir, "config.json"), "utf8")),
    );
    expect(manifest.provenance["patchesHash"]).toBeDefined();
    expect(manifest.provenance["engineVersion"]).toBeDefined();

    const verified = spawn(["verify", "--vendor", vendorDir, "--against", out]);
    expect(verified.status, verified.stderr).toBe(0);

    const emitted = spawn(["--emit-ir", "--vendor", vendorDir]);
    expect(emitted.status, emitted.stderr).toBe(0);
    expect(JSON.parse(emitted.stdout)).toMatchObject({
      vendor: { slug: "northstar" },
    });
  });

  it("rejects ambiguous input sources", () => {
    const result = spawn([
      "generate",
      "--ir",
      "x.json",
      "--vendor",
      "y",
      "--out",
      "z",
    ]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("exactly one of --ir and --vendor");
  });

  it("aborts strict generation on a non-applying patch, naming the entry", () => {
    const dir = temp();
    const vendorDir = join(dir, "vendor");
    writeVendorDir(vendorDir, {
      spec: northstarSpec,
      config: northstarConfig,
      patches: {
        "001-missing-target.patch.json": patchEntry("001-missing-target", {
          kind: "sensitive-marking",
          schemaPath: "/components/schemas/Vanished/properties/x",
        }),
      },
    });
    const result = spawn([
      "generate",
      "--vendor",
      vendorDir,
      "--out",
      join(dir, "out"),
    ]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("patch 001-missing-target");
    expect(result.stderr).toContain("stale");
  });

  it("reconciliation mode completes generation and writes the gating report", () => {
    const dir = temp();
    const vendorDir = join(dir, "vendor");
    writeVendorDir(vendorDir, {
      spec: northstarSpec,
      config: northstarConfig,
      patches: {
        "001-widget-get-conflict.patch.json": conflictInjection(),
        "002-missing-target.patch.json": patchEntry("002-missing-target", {
          kind: "error-response-injection",
          operationPath: "/paths/~1vanished/get",
          status: "410",
          response: { description: "Gone." },
        }),
      },
    });
    const out = join(dir, "out");
    const reportPath = join(dir, "reconcile-report.json");
    const result = spawn([
      "generate",
      "--vendor",
      vendorDir,
      "--reconcile",
      reportPath,
      "--out",
      out,
    ]);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stderr).toContain("002-missing-target: stale");
    expect(existsSync(join(out, "MANIFEST"))).toBe(true);
    const report = JSON.parse(readFileSync(reportPath, "utf8")) as {
      clean: boolean;
      entries: ReadonlyArray<{ id: string; classification: string }>;
    };
    expect(report.clean).toBe(false);
    expect(report.entries).toEqual([
      expect.objectContaining({
        id: "001-widget-get-conflict",
        classification: "still_needed",
      }),
      expect.objectContaining({
        id: "002-missing-target",
        classification: "stale",
      }),
    ]);
  });

  it("enforces the component-target operation enumeration rule", () => {
    const dir = temp();
    const vendorDir = join(dir, "vendor");
    const marking = (over: JsonObject = {}): JsonValue =>
      patchEntry(
        "001-name-secret",
        {
          kind: "sensitive-marking",
          schemaPath: "/components/schemas/Widget/properties/name",
          precondition: {
            pointer: "/components/schemas/Widget/properties/name",
            test: { type: "string" },
          },
        },
        over,
      );
    writeVendorDir(vendorDir, {
      spec: northstarSpec,
      config: northstarConfig,
      patches: { "001-name-secret.patch.json": marking() },
    });
    expect(() => buildVendorIr(vendorDir)).toThrow(
      /patch\.blast-radius\.operations/u,
    );
    writeVendorDir(vendorDir, {
      spec: northstarSpec,
      config: northstarConfig,
      patches: {
        "001-name-secret.patch.json": marking({
          blastRadius: {
            role: "response",
            operations: ["widgets.get"],
            expectedFiles: ["src/schemas.ts"],
          },
        }),
      },
    });
    const build = buildVendorIr(vendorDir);
    expect(
      build.ir.namedSchemas[0]!.schema.fields.find(
        (field) => field.name === "name",
      )?.schema.kind,
    ).toBe("secret");

    const audit = auditPatchLocalityFrom(loadVendorDir(vendorDir), {
      generateOptions: { formatter: identity },
    });
    expect(audit.ok, JSON.stringify(audit.entries, null, 2)).toBe(true);
    expect(audit.entries[0]!.actualOperations).toEqual(["widgets.get"]);
  });

  it("rejects a patch file whose id does not match its basename", () => {
    const dir = temp();
    const vendorDir = join(dir, "vendor");
    writeVendorDir(vendorDir, {
      spec: northstarSpec,
      config: northstarConfig,
      patches: {
        "001-a.patch.json": patchEntry("001-b", {
          kind: "spec-pruning",
          target: "/components/schemas/Widget",
        }),
      },
    });
    expect(() => loadVendorDir(vendorDir)).toThrow(/patch\.id/u);
  });

  it("rejects stray files in the patches directory", () => {
    const dir = temp();
    const vendorDir = join(dir, "vendor");
    writeVendorDir(vendorDir, {
      spec: northstarSpec,
      config: northstarConfig,
    });
    const patchesDir = join(vendorDir, "patches");
    mkdirSync(patchesDir, { recursive: true });
    writeFileSync(join(patchesDir, "001-typo.patch.jsonn"), "{}");
    expect(() => loadVendorDir(vendorDir)).toThrow(/patch\.stray-file/u);
  });

  it("rejects --reconcile outside generate", () => {
    const result = spawn([
      "verify",
      "--vendor",
      "v",
      "--against",
      "a",
      "--reconcile",
      "r.json",
    ]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("--reconcile is only valid on generate");
  });
});

describe("patch-locality audit (blast-radius symmetry)", () => {
  it("fails on asymmetry in both directions and passes on the exact declaration", () => {
    const dir = temp();
    const vendorDir = join(dir, "vendor");
    writeVendorDir(vendorDir, {
      spec: northstarSpec,
      config: northstarConfig,
      patches: {
        "001-widget-get-conflict.patch.json": conflictInjection({
          blastRadius: {
            role: "error",
            expectedFiles: ["src/errors.ts", "src/never-touched.ts"],
          },
        }),
      },
    });
    const asymmetric = auditPatchLocalityFrom(loadVendorDir(vendorDir), {
      generateOptions: { formatter: identity },
    });
    expect(asymmetric.ok).toBe(false);
    const entry = asymmetric.entries[0]!;
    expect(entry.missingFiles).toContain("src/never-touched.ts");
    expect(entry.unexpectedFiles.length).toBeGreaterThan(0);
    expect(entry.actualOperations).toEqual(["widgets.get"]);
    expect(entry.declaredOperations).toEqual(["widgets.get"]);
    expect(entry.actualFiles).toContain("src/resources/widgets.ts");
    expect(entry.actualFiles).toContain("src/errors.ts");

    writeVendorDir(vendorDir, {
      spec: northstarSpec,
      config: northstarConfig,
      patches: {
        "001-widget-get-conflict.patch.json": conflictInjection({
          blastRadius: {
            role: "error",
            expectedFiles: entry.actualFiles,
          },
        }),
      },
    });
    const symmetric = auditPatchLocalityFrom(loadVendorDir(vendorDir), {
      generateOptions: { formatter: identity },
    });
    expect(symmetric.ok, JSON.stringify(symmetric.entries, null, 2)).toBe(true);
    expect(symmetric.entries[0]!.staleAuthorship).toBe(true);
  });

  it("audit-patches CLI exits 2 on asymmetry and 1 on a tampered snapshot", () => {
    const dir = temp();
    const vendorDir = join(dir, "vendor");
    writeVendorDir(vendorDir, {
      spec: northstarSpec,
      config: northstarConfig,
      patches: {
        "001-widget-get-conflict.patch.json": conflictInjection({
          blastRadius: {
            role: "error",
            expectedFiles: ["src/never-touched.ts"],
          },
        }),
      },
    });
    const asymmetric = spawn(["audit-patches", "--vendor", vendorDir]);
    expect(asymmetric.status, asymmetric.stderr).toBe(2);
    const report = JSON.parse(asymmetric.stdout) as {
      ok: boolean;
      entries: ReadonlyArray<{ missingFiles: ReadonlyArray<string> }>;
    };
    expect(report.ok).toBe(false);
    expect(report.entries[0]!.missingFiles).toContain("src/never-touched.ts");

    const specPath = join(vendorDir, "spec.json");
    writeFileSync(
      specPath,
      readFileSync(specPath, "utf8").replace("3.1.0", "3.1.1"),
    );
    const tampered = spawn(["audit-patches", "--vendor", vendorDir]);
    expect(tampered.status).toBe(1);
    expect(tampered.stderr).toContain("attestation.mismatch");
  });

  it("flags a declared role the actual diff does not fit", () => {
    const dir = temp();
    const vendorDir = join(dir, "vendor");
    writeVendorDir(vendorDir, {
      spec: northstarSpec,
      config: northstarConfig,
      patches: {
        "001-widget-get-conflict.patch.json": conflictInjection({
          blastRadius: { role: "request", expectedFiles: [] },
        }),
      },
    });
    const result = auditPatchLocalityFrom(loadVendorDir(vendorDir), {
      generateOptions: { formatter: identity },
    });
    expect(result.ok).toBe(false);
    expect(
      result.entries[0]!.roleViolations.some((violation) =>
        violation.includes("error facet"),
      ),
    ).toBe(true);
  });
});

describe("pointer-level spec diff", () => {
  it("classifies parameter additions, type changes, and required removals", () => {
    const before = northstarSpec;
    const after = JSON.parse(JSON.stringify(northstarSpec)) as JsonObject;
    const item = (after["paths"] as JsonObject)["/widgets/{id}"] as {
      get: { parameters: JsonValue[] };
    };
    item.get.parameters.push({
      name: "expand",
      in: "query",
      required: false,
      schema: { type: "string" },
    });
    const widget = (
      (after["components"] as JsonObject)["schemas"] as JsonObject
    )["Widget"] as {
      properties: { name: { type: string } };
      required: string[];
    };
    widget.properties.name.type = "number";
    widget.required = ["id"];

    const diff = diffSpecs(before, after);
    expect(diff.identical).toBe(false);
    const classifications = diff.entries.map((entry) => [
      entry.classification,
      entry.pointer,
    ]);
    expect(classifications).toContainEqual([
      "parameter-added",
      "/paths/~1widgets~1{id}/get/parameters/1",
    ]);
    expect(classifications).toContainEqual([
      "type-changed",
      "/components/schemas/Widget/properties/name/type",
    ]);
    expect(classifications).toContainEqual([
      "required-entry-removed",
      "/components/schemas/Widget/required/1",
    ]);
    expect(diffSpecs(before, before).identical).toBe(true);

    const frontRemoval = diffSpecs(
      { required: ["id", "name"] },
      { required: ["name"] },
    );
    expect(frontRemoval.entries).toEqual([
      {
        pointer: "/required/0",
        change: "removed",
        classification: "required-entry-removed",
        before: "id",
      },
    ]);

    const dir = temp();
    const beforePath = join(dir, "before.json");
    const afterPath = join(dir, "after.json");
    writeFileSync(beforePath, printJson(before));
    writeFileSync(afterPath, printJson(after as JsonValue));
    const cli = spawn([
      "spec-diff",
      "--before",
      beforePath,
      "--after",
      afterPath,
    ]);
    expect(cli.status, cli.stderr).toBe(0);
    expect(JSON.parse(cli.stdout)).toMatchObject({ identical: false });
  });
});
