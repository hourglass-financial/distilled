import { CodegenError, type CodegenViolation } from "../../errors.ts";
import type { ClientIr } from "../../ir/model.ts";
import {
  applyPatchesReconciling,
  applyPatchesStrict,
  entryTargetPointers,
  type PatchEntry,
  type PatchReconciliation,
} from "./patches.ts";
import { normalizeOpenApiWithConfigShadows } from "./normalize.ts";
import {
  auditAttestation,
  loadVendorDir,
  type VendorDir,
} from "./vendor-dir.ts";

/**
 * The OpenAPI frontend (#31 §2): load → patch → normalize, producing the
 * fully-resolved `ClientIr` the vendor-blind emitters consume. Strict mode
 * is the posture everywhere; `reconcile` exists for the spec-sync workflow
 * alone, whose stale-entry report gates the PR (#29).
 */

export type PatchMode = "strict" | "reconcile";

export interface FrontendProvenance {
  readonly specHash: string;
  readonly configHash: string;
  readonly patchesHash: string;
}

export interface VendorBuild {
  readonly ir: ClientIr;
  readonly provenance: FrontendProvenance;
  readonly reconciliation: PatchReconciliation | undefined;
}

const isComponentTargeted = (entry: PatchEntry): boolean =>
  entryTargetPointers(entry).some((pointer) => !pointer.startsWith("/paths/"));

/**
 * Structural blast-radius rules enforceable before regeneration: a
 * component-path entry must enumerate its affected operations (rule 1's
 * escape clause), and every declared operation must name a resolved public
 * operation. The symmetric diff verification runs in the patch-locality
 * audit, which regenerates per entry.
 */
const checkBlastRadiusDeclarations = (
  entries: ReadonlyArray<PatchEntry>,
  ir: ClientIr,
): void => {
  const qualified = new Set(
    ir.resources.flatMap((resource) =>
      resource.operations.map(
        (operation) =>
          `${operation.publicName.resource}.${operation.publicName.method}`,
      ),
    ),
  );
  const violations: CodegenViolation[] = [];
  for (const entry of entries) {
    if (!("expectedFiles" in entry.blastRadius)) continue;
    const construct = `patch ${entry.id}`;
    if (
      isComponentTargeted(entry) &&
      entry.blastRadius.operations === undefined
    ) {
      violations.push({
        rule: "patch.blast-radius.operations",
        construct,
        message:
          "component-path entries must enumerate their affected operations",
      });
    }
    for (const name of entry.blastRadius.operations ?? []) {
      if (!qualified.has(name)) {
        violations.push({
          rule: "patch.blast-radius.unknown-operation",
          construct,
          message: `declared operation ${JSON.stringify(name)} does not resolve to a public operation`,
        });
      }
    }
  }
  if (violations.length > 0) throw new CodegenError(violations);
};

const checkAttestation = (dir: string): void => {
  const attestation = auditAttestation(dir);
  if (!attestation.ok) {
    throw new CodegenError([
      {
        rule: "attestation.mismatch",
        construct: attestation.specFile,
        message: `snapshot hash ${attestation.actualHash} does not match the provenance record's ${attestation.expectedHash}; re-run acquisition or restore the snapshot`,
      },
    ]);
  }
};

/** Build the IR for one already-loaded vendor input tree. */
export const buildVendorIrFrom = (
  vendor: VendorDir,
  mode: PatchMode,
): VendorBuild => {
  let document = vendor.spec;
  let reconciliation: PatchReconciliation | undefined;
  if (mode === "reconcile") {
    reconciliation = applyPatchesReconciling(
      document,
      vendor.patches,
      vendor.specHash,
    );
    document = reconciliation.document;
  } else {
    document = applyPatchesStrict(document, vendor.patches);
  }
  const normalized = normalizeOpenApiWithConfigShadows(document, vendor.config);
  const ir = normalized.ir;
  if (reconciliation !== undefined) {
    reconciliation = {
      ...reconciliation,
      configShadows: normalized.configShadows,
    };
  }
  // In reconcile mode the structural checks cover only the entries that
  // applied: a stale entry whose declared operations vanished must reach the
  // report, not abort the run that exists to report it.
  const applied =
    reconciliation === undefined
      ? vendor.patches
      : vendor.patches.filter((entry) =>
          reconciliation!.entries.some(
            (report) =>
              report.id === entry.id &&
              report.classification === "still_needed",
          ),
        );
  checkBlastRadiusDeclarations(applied, ir);
  return {
    ir,
    provenance: {
      specHash: vendor.specHash,
      configHash: vendor.configHash,
      patchesHash: vendor.patchesHash,
    },
    reconciliation,
  };
};

/**
 * Load a `vendors/<vendor>/` tree and build its IR. The attestation check
 * runs first: generation from a tampered snapshot is a hard error, not a
 * separate-audit-only concern.
 */
export const buildVendorIr = (
  vendorDir: string,
  mode: PatchMode = "strict",
): VendorBuild => {
  checkAttestation(vendorDir);
  return buildVendorIrFrom(loadVendorDir(vendorDir), mode);
};
