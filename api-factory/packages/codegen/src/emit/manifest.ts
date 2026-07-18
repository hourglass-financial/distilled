import { createHash } from "node:crypto";
import type { EmittedFile } from "./shared.ts";
import { codeUnitCompare, emitted } from "./shared.ts";

export const emitManifest = (
  files: ReadonlyArray<EmittedFile>,
  engineVersion: string,
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
        provenance: { engineVersion },
        files: Object.fromEntries(entries),
      },
      null,
      2,
    )}\n`,
  );
};
