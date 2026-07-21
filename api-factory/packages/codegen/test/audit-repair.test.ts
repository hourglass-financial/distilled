import { describe, expect, it } from "vitest";
import {
  auditPatchLocalityFrom,
  CodegenError,
  decodePatchEntry,
  loadVendorDir,
  normalizeOpenApi,
  type Formatter,
  type JsonObject,
  type JsonValue,
  type PatchLocalityOptions,
} from "../src/index.ts";
import {
  northstarConfig,
  northstarSpec,
  patchEntry,
  writeVendorDir,
} from "./fixtures/openapi.ts";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const temp = (): string => mkdtempSync(join(tmpdir(), "patch-repair-test-"));
const identity: Formatter = (files) => files;
const audit = (
  dir: string,
  options: Omit<PatchLocalityOptions, "generateOptions"> = {},
) =>
  auditPatchLocalityFrom(loadVendorDir(dir), {
    generateOptions: { formatter: identity },
    ...options,
  });

const normalizeWithConstruct = (rule: string, construct: string) =>
  ((document, config) => {
    try {
      return normalizeOpenApi(document, config);
    } catch (cause) {
      if (!(cause instanceof CodegenError)) throw cause;
      throw new CodegenError(
        cause.violations.map((violation) =>
          violation.rule === rule ? { ...violation, construct } : violation,
        ),
      );
    }
  }) satisfies NonNullable<PatchLocalityOptions["normalize"]>;

const blockedSpec = (): JsonObject => {
  const spec = JSON.parse(JSON.stringify(northstarSpec)) as JsonObject;
  const schemas = (spec["components"] as JsonObject)["schemas"] as Record<
    string,
    JsonValue
  >;
  schemas["Widget"] = {
    type: "object",
    description: "A Northstar widget.",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      labels: {
        allOf: [
          {
            type: "object",
            properties: { free: { type: "object" } },
            required: ["free"],
          },
        ],
      },
    },
    required: ["id", "name", "labels"],
  };
  return spec;
};

const allOfBefore = (spec: JsonObject): JsonValue =>
  (
    (
      ((spec["components"] as JsonObject)["schemas"] as JsonObject)[
        "Widget"
      ] as JsonObject
    )["properties"] as JsonObject
  )["labels"] as JsonValue;

const repairPatches = (
  spec: JsonObject,
  diffFiles: ReadonlyArray<string> = [],
): Record<string, JsonValue> => ({
  "010-flatten-widget.patch.json": patchEntry(
    "010-flatten-widget",
    {
      kind: "allof-flatten",
      target: "/components/schemas/Widget/properties/labels",
      precondition: {
        pointer: "/components/schemas/Widget/properties/labels",
        test: allOfBefore(spec),
      },
    },
    {
      blastRadius: {
        role: "response",
        clears: [
          {
            rule: "openapi.schema.allof",
            construct: "/components/schemas/Widget/properties/labels",
          },
        ],
      },
    },
  ),
  "020-shape-labels.patch.json": patchEntry(
    "020-shape-labels",
    {
      kind: "record-shape",
      target: "/components/schemas/Widget/properties/labels/properties/free",
      valueSchema: { type: "string" },
      precondition: {
        pointer: "/components/schemas/Widget/properties/labels/properties/free",
        test: { type: "object" },
      },
    },
    {
      blastRadius: {
        role: "response",
        clears: [
          {
            rule: "openapi.schema.free-form",
            construct:
              "/components/schemas/Widget/properties/labels/properties/free",
          },
        ],
      },
    },
  ),
  "030-widget-conflict.patch.json": patchEntry(
    "030-widget-conflict",
    {
      kind: "error-response-injection",
      operationPath: "/paths/~1widgets~1{id}/get",
      status: "409",
      response: { description: "The widget is locked." },
      precondition: {
        pointer: "/paths/~1widgets~1{id}/get/responses/409",
        absent: true,
      },
    },
    {
      blastRadius: { role: "error", expectedFiles: diffFiles },
    },
  ),
});

const repairPatchesWithConstruct = (
  spec: JsonObject,
  construct: string,
): Record<string, JsonValue> => {
  const patches = repairPatches(spec);
  patches["010-flatten-widget.patch.json"] = patchEntry(
    "010-flatten-widget",
    {
      kind: "allof-flatten",
      target: "/components/schemas/Widget/properties/labels",
      precondition: {
        pointer: "/components/schemas/Widget/properties/labels",
        test: allOfBefore(spec),
      },
    },
    {
      blastRadius: {
        role: "response",
        clears: [{ rule: "openapi.schema.allof", construct }],
      },
    },
  );
  return patches;
};

const auditRepairWithConstruct = (construct: string) => {
  const dir = temp();
  try {
    const spec = blockedSpec();
    writeVendorDir(dir, {
      spec,
      config: northstarConfig,
      patches: repairPatchesWithConstruct(spec, construct),
    });
    return audit(dir, {
      normalize: normalizeWithConstruct("openapi.schema.allof", construct),
    }).entries[0]!;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

describe("patch-locality repair mode", () => {
  it("audits a mixed repair-to-diff sequence, reports exposed violations, and memoizes prefixes", () => {
    const dir = temp();
    try {
      const spec = blockedSpec();
      writeVendorDir(dir, {
        spec,
        config: northstarConfig,
        patches: repairPatches(spec),
      });
      const first = audit(dir);
      const diffFiles = first.entries[2]!.actualFiles;
      writeVendorDir(dir, {
        spec,
        config: northstarConfig,
        patches: repairPatches(spec, diffFiles),
      });

      let normalizationCalls = 0;
      const memoized = audit(dir, {
        normalize: (document, config) => {
          normalizationCalls += 1;
          return normalizeOpenApi(document, config);
        },
      });
      const ordinary = audit(dir);

      expect(memoized).toEqual(ordinary);
      expect(normalizationCalls).toBe(4);
      expect(memoized.ok, JSON.stringify(memoized.entries, null, 2)).toBe(true);
      expect(memoized.entries.map((entry) => entry.mode)).toEqual([
        "repair",
        "repair",
        "diff",
      ]);
      expect(memoized.entries[0]!.actualClears).toEqual([
        expect.objectContaining({
          rule: "openapi.schema.allof",
          construct: "/components/schemas/Widget/properties/labels",
        }),
      ]);
      expect(memoized.entries[0]!.exposed).toEqual([
        expect.objectContaining({
          rule: "openapi.schema.free-form",
          construct:
            "/components/schemas/Widget/properties/labels/properties/free",
        }),
      ]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 30_000);

  it("compares cleared violations as a multiset in both directions", () => {
    const dir = temp();
    try {
      const spec = blockedSpec();
      const duplicate = {
        rule: "openapi.schema.allof",
        construct: "/components/schemas/Widget/properties/labels",
      };
      const patches = repairPatches(spec);
      patches["010-flatten-widget.patch.json"] = patchEntry(
        "010-flatten-widget",
        {
          kind: "allof-flatten",
          target: "/components/schemas/Widget/properties/labels",
          precondition: {
            pointer: "/components/schemas/Widget/properties/labels",
            test: allOfBefore(spec),
          },
        },
        {
          blastRadius: {
            role: "response",
            clears: [duplicate, duplicate],
          },
        },
      );
      writeVendorDir(dir, { spec, config: northstarConfig, patches });
      const result = audit(dir);
      expect(result.ok).toBe(false);
      expect(result.entries[0]!.missingClears).toEqual([duplicate]);
      expect(result.entries[0]!.unexpectedClears).toEqual([]);

      patches["010-flatten-widget.patch.json"] = patchEntry(
        "010-flatten-widget",
        {
          kind: "allof-flatten",
          target: "/components/schemas/Widget/properties/labels",
          precondition: {
            pointer: "/components/schemas/Widget/properties/labels",
            test: allOfBefore(spec),
          },
        },
        {
          blastRadius: {
            role: "response",
            clears: [
              {
                rule: "openapi.schema.not",
                construct: "/components/schemas/Widget/properties/labels",
              },
            ],
          },
        },
      );
      writeVendorDir(dir, { spec, config: northstarConfig, patches });
      const undeclared = audit(dir);
      expect(undeclared.ok).toBe(false);
      expect(undeclared.entries[0]!.missingClears).toHaveLength(1);
      expect(undeclared.entries[0]!.unexpectedClears).toEqual([
        expect.objectContaining(duplicate),
      ]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("scopes an annotated violation by its leading JSON pointer", () => {
    const entry = auditRepairWithConstruct(
      "/components/schemas/Widget/properties/labels (response labels)",
    );

    expect(entry.ok).toBe(true);
    expect(entry.targetScopeViolations).toEqual([]);
  });

  it.each([
    ["above", "/components/schemas/Widget/properties"],
    ["below", "/components/schemas/Widget/properties/labels/allOf/0"],
  ])(
    "accepts a construct pointer %s the repair edit target",
    (_, construct) => {
      const entry = auditRepairWithConstruct(construct);

      expect(entry.ok).toBe(true);
      expect(entry.targetScopeViolations).toEqual([]);
    },
  );

  it("exempts non-pointer violation constructs from target scoping", () => {
    const entry = auditRepairWithConstruct(
      "operation widgets.get constantBody.grant_type",
    );

    expect(entry.ok).toBe(true);
    expect(entry.targetScopeViolations).toEqual([]);
  });

  it("ignores config-rule flaps while auditing repair clears", () => {
    const dir = temp();
    try {
      const spec = blockedSpec();
      writeVendorDir(dir, {
        spec,
        config: northstarConfig,
        patches: repairPatches(spec),
      });

      const result = audit(dir, {
        normalize: (document, config) => {
          try {
            return normalizeOpenApi(document, config);
          } catch (cause) {
            if (!(cause instanceof CodegenError)) throw cause;
            const hasAllOfViolation = cause.violations.some(
              ({ rule }) => rule === "openapi.schema.allof",
            );
            throw new CodegenError([
              ...cause.violations,
              ...(hasAllOfViolation
                ? [
                    {
                      rule: "config.schema-override.unknown",
                      construct: "schemas.ExtractedLabels",
                      message: "no emitted named schema has this name yet",
                    },
                  ]
                : []),
            ]);
          }
        },
      });

      expect(result.entries[0]!.ok).toBe(true);
      expect(result.entries[0]!.declaredClears).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ rule: expect.stringMatching(/^config\./) }),
        ]),
      );
      expect(result.entries[0]!.actualClears).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ rule: expect.stringMatching(/^config\./) }),
        ]),
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("reports mode/declaration asymmetry in both directions", () => {
    const normalDir = temp();
    const blockedDir = temp();
    try {
      writeVendorDir(normalDir, {
        spec: northstarSpec,
        config: northstarConfig,
        patches: {
          "010-repair-on-normal.patch.json": patchEntry(
            "010-repair-on-normal",
            {
              kind: "error-response-injection",
              operationPath: "/paths/~1widgets~1{id}/get",
              status: "409",
              response: { description: "Conflict." },
            },
            {
              blastRadius: {
                role: "error",
                clears: [
                  {
                    rule: "openapi.schema.allof",
                    construct: "/components/schemas/Widget/properties/labels",
                  },
                ],
              },
            },
          ),
        },
      });
      const normal = audit(normalDir);
      expect(normal.entries[0]!.mode).toBe("diff");
      expect(normal.entries[0]!.declarationViolations).toHaveLength(1);

      const spec = blockedSpec();
      const patches = repairPatches(spec);
      patches["010-flatten-widget.patch.json"] = patchEntry(
        "010-flatten-widget",
        {
          kind: "allof-flatten",
          target: "/components/schemas/Widget/properties/labels",
          precondition: {
            pointer: "/components/schemas/Widget/properties/labels",
            test: allOfBefore(spec),
          },
        },
        { blastRadius: { role: "response", expectedFiles: [] } },
      );
      writeVendorDir(blockedDir, {
        spec,
        config: northstarConfig,
        patches,
      });
      const blocked = audit(blockedDir);
      expect(blocked.entries[0]!.mode).toBe("repair");
      expect(blocked.entries[0]!.declarationViolations).toHaveLength(1);
    } finally {
      rmSync(normalDir, { recursive: true, force: true });
      rmSync(blockedDir, { recursive: true, force: true });
    }
  });

  it("rejects repair edits outside every declared construct", () => {
    const dir = temp();
    try {
      const spec = blockedSpec();
      writeVendorDir(dir, {
        spec,
        config: northstarConfig,
        patches: {
          "010-smuggled-edit.patch.json": patchEntry(
            "010-smuggled-edit",
            {
              kind: "raw",
              ops: [
                {
                  op: "replace",
                  path: "/info/title",
                  value: "Smuggled",
                },
              ],
            },
            {
              blastRadius: {
                role: "metadata",
                clears: [
                  {
                    rule: "openapi.schema.allof",
                    construct: "/components/schemas/Widget/properties/labels",
                  },
                ],
              },
            },
          ),
        },
      });
      const result = audit(dir);
      expect(result.ok).toBe(false);
      expect(result.entries[0]!.targetScopeViolations).toEqual([
        expect.stringContaining("/info/title"),
      ]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("rejects empty clears and mixed repair/diff declarations at decode", () => {
    const base = patchEntry(
      "010-empty",
      { kind: "spec-pruning", target: "/x" },
      { blastRadius: { role: "metadata", clears: [] } },
    );
    expect(() => decodePatchEntry(base, "empty-clears")).toThrow(CodegenError);
    expect(() =>
      decodePatchEntry(
        {
          ...(base as JsonObject),
          blastRadius: {
            role: "metadata",
            clears: [{ rule: "x", construct: "/x" }],
            expectedFiles: [],
          },
        },
        "mixed-declarations",
      ),
    ).toThrow(CodegenError);
  });
});
