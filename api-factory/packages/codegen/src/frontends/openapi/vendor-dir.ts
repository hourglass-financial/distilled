import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import * as Schema from "effect/Schema";
import { CodegenError } from "../../errors.ts";
import {
  type VendorConfig,
  VendorConfigSchema,
} from "../../ir/vendor-config.ts";
import type { JsonValue } from "./json.ts";
import { decodePatchEntry, type PatchEntry } from "./patches.ts";

/**
 * The `vendors/<vendor>/` input-tree contract (#27 L0/L1):
 *
 * - `spec.json` — the attested snapshot, written only by the acquisition
 *   command (machine-locked);
 * - `spec.provenance.json` — the provenance record pinning the snapshot by
 *   content hash (machine-locked);
 * - `config.json` — the vendor config (agent-writable);
 * - `patches/NNN-<slug>.patch.json` — one patch entry per file, applied in
 *   code-unit filename order; each entry's `id` must equal its basename.
 *
 * Everything is JSON so the CLI never imports vendor-supplied code — the
 * same execution-surface rationale that fixed IR JSON as the CLI
 * interchange (ADR-0002).
 */

export const SPEC_FILE = "spec.json";
export const PROVENANCE_FILE = "spec.provenance.json";
export const CONFIG_FILE = "config.json";
export const PATCHES_DIR = "patches";

const PATCH_SUFFIX = ".patch.json";

export const ProvenanceSchema = Schema.Struct({
  sourceUrl: Schema.String,
  upstreamRef: Schema.optional(Schema.String),
  fetchedAt: Schema.String,
  contentHash: Schema.String,
  sourceFormat: Schema.Literals(["json", "yaml"] as const),
  sourceContentHash: Schema.optional(Schema.String),
});

export interface ProvenanceRecord extends Schema.Schema.Type<
  typeof ProvenanceSchema
> {}

const decodeOptions = { errors: "all", onExcessProperty: "error" } as const;

export const sha256 = (contents: string | Uint8Array): string =>
  `sha256-${createHash("sha256").update(contents).digest("hex")}`;

const codeUnitCompare = (left: string, right: string): number =>
  left < right ? -1 : left > right ? 1 : 0;

const fail = (rule: string, construct: string, message: string): never => {
  throw new CodegenError([{ rule, construct, message }]);
};

const readRequired = (dir: string, name: string): string => {
  const path = join(dir, name);
  if (!existsSync(path)) {
    return fail(
      "vendor-dir.missing",
      name,
      `required vendor file ${JSON.stringify(name)} does not exist in ${JSON.stringify(dir)}`,
    );
  }
  return readFileSync(path, "utf8");
};

const parseJson = (contents: string, construct: string): JsonValue => {
  try {
    return JSON.parse(contents) as JsonValue;
  } catch (cause) {
    return fail(
      "vendor-dir.json",
      construct,
      cause instanceof Error ? cause.message : String(cause),
    );
  }
};

export interface VendorDir {
  readonly dir: string;
  readonly spec: JsonValue;
  readonly provenance: ProvenanceRecord;
  readonly config: VendorConfig;
  readonly patches: ReadonlyArray<PatchEntry>;
  /** sha256 of the snapshot bytes as checked in. */
  readonly specHash: string;
  /** sha256 of the vendor config bytes as checked in. */
  readonly configHash: string;
  /** Combined digest over the sorted patch files (name + content hash). */
  readonly patchesHash: string;
}

export const decodeVendorConfig = (input: unknown): VendorConfig => {
  try {
    return Schema.decodeUnknownSync(VendorConfigSchema, decodeOptions)(input);
  } catch (cause) {
    return fail(
      "config.decode",
      CONFIG_FILE,
      cause instanceof Error ? cause.message : String(cause),
    );
  }
};

export const decodeProvenance = (input: unknown): ProvenanceRecord => {
  try {
    return Schema.decodeUnknownSync(ProvenanceSchema, decodeOptions)(input);
  } catch (cause) {
    return fail(
      "provenance.decode",
      PROVENANCE_FILE,
      cause instanceof Error ? cause.message : String(cause),
    );
  }
};

const loadPatches = (
  dir: string,
): { readonly patches: ReadonlyArray<PatchEntry>; readonly hash: string } => {
  const patchesDir = join(dir, PATCHES_DIR);
  if (!existsSync(patchesDir)) return { patches: [], hash: sha256("") };
  const entries = readdirSync(patchesDir).sort(codeUnitCompare);
  for (const name of entries) {
    // Dotfiles (e.g. .DS_Store) are tolerated; anything else that is not a
    // patch file would otherwise sit in the patch directory and silently
    // never apply, never hash, and never reach a gate.
    if (!name.startsWith(".") && !name.endsWith(PATCH_SUFFIX)) {
      fail(
        "patch.stray-file",
        `${PATCHES_DIR}/${name}`,
        `only *.patch.json files may live in ${PATCHES_DIR}/`,
      );
    }
  }
  const names = entries.filter((name) => name.endsWith(PATCH_SUFFIX));
  const patches: PatchEntry[] = [];
  const digest = createHash("sha256");
  for (const name of names) {
    const contents = readFileSync(join(patchesDir, name), "utf8");
    digest.update(`${name}\n${sha256(contents)}\n`);
    const entry = decodePatchEntry(
      parseJson(contents, `${PATCHES_DIR}/${name}`),
      `${PATCHES_DIR}/${name}`,
    );
    const expectedId = name.slice(0, -PATCH_SUFFIX.length);
    if (entry.id !== expectedId) {
      fail(
        "patch.id",
        `patch ${PATCHES_DIR}/${name}`,
        `entry id ${JSON.stringify(entry.id)} must equal the file basename ${JSON.stringify(expectedId)}`,
      );
    }
    patches.push(entry);
  }
  return { patches, hash: `sha256-${digest.digest("hex")}` };
};

/** Load and validate a vendor input tree. Fail-closed on every file. */
export const loadVendorDir = (dir: string): VendorDir => {
  const specContents = readRequired(dir, SPEC_FILE);
  const provenance = decodeProvenance(
    parseJson(readRequired(dir, PROVENANCE_FILE), PROVENANCE_FILE),
  );
  const configContents = readRequired(dir, CONFIG_FILE);
  const config = decodeVendorConfig(parseJson(configContents, CONFIG_FILE));
  const { patches, hash: patchesHash } = loadPatches(dir);
  return {
    dir,
    spec: parseJson(specContents, SPEC_FILE),
    provenance,
    config,
    patches,
    specHash: sha256(specContents),
    configHash: sha256(configContents),
    patchesHash,
  };
};

export interface AttestationResult {
  readonly vendorDir: string;
  readonly specFile: string;
  readonly expectedHash: string;
  readonly actualHash: string;
  readonly ok: boolean;
}

/**
 * The attestation audit (#27 L0): verify the snapshot hash against the
 * provenance record. "Fix the spec in place" fails here; the only sanctioned
 * contract-fix move is a patch.
 */
export const auditAttestation = (dir: string): AttestationResult => {
  const specContents = readRequired(dir, SPEC_FILE);
  const provenance = decodeProvenance(
    parseJson(readRequired(dir, PROVENANCE_FILE), PROVENANCE_FILE),
  );
  const actualHash = sha256(specContents);
  return {
    vendorDir: dir,
    specFile: SPEC_FILE,
    expectedHash: provenance.contentHash,
    actualHash,
    ok: provenance.contentHash === actualHash,
  };
};
