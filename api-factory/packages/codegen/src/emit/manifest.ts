import { createHash } from "node:crypto";
import type { EmittedFile } from "./shared.ts";
import { codeUnitCompare, emitted } from "./shared.ts";

/**
 * Generation provenance recorded in the MANIFEST (ADR-0003). `engineVersion`
 * is always present; `specHash`/`configHash`/`patchesHash` are supplied when
 * generation ran from a vendor input tree (#48) and absent for direct IR
 * input — a provenance field that attests nothing is never fabricated.
 */
export interface ManifestProvenance {
  readonly engineVersion: string;
  readonly specHash?: string | undefined;
  readonly configHash?: string | undefined;
  readonly patchesHash?: string | undefined;
}

export const emitManifest = (
  files: ReadonlyArray<EmittedFile>,
  provenance: ManifestProvenance,
): EmittedFile => {
  const entries = files
    .filter((file) => file.path !== "MANIFEST")
    .map(
      (file) =>
        [
          file.path,
          `sha256-${createHash("sha256").update(file.contents).digest("hex")}`,
        ] as const,
    )
    .sort(([left], [right]) => codeUnitCompare(left, right));
  return emitted(
    "MANIFEST",
    `${JSON.stringify(
      {
        generator: "@hourglass-financial/api-factory-codegen",
        provenance: {
          engineVersion: provenance.engineVersion,
          ...(provenance.specHash === undefined
            ? {}
            : { specHash: provenance.specHash }),
          ...(provenance.configHash === undefined
            ? {}
            : { configHash: provenance.configHash }),
          ...(provenance.patchesHash === undefined
            ? {}
            : { patchesHash: provenance.patchesHash }),
        },
        files: Object.fromEntries(entries),
      },
      null,
      2,
    )}\n`,
  );
};
