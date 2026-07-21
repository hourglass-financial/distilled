/**
 * The coverage audit (#30, decisions 3, 5, 6) — deterministic, JSON-out,
 * and write-nothing.
 *
 * It polices structure and honesty only: universe drift in both directions
 * (a registry operation with no manifest entry; a stale entry for a removed
 * operation), canonical key order, and entry well-formedness. It never
 * enforces coverage floors — those are workflow policy over this report's
 * `counts` — and it never writes the manifest: missing entries come back as
 * paste-ready stubs for a reviewed edit.
 *
 * The operation universe is the generated client's registry
 * (`src/registry.ts`), which the regen gate byte-locks to the IR — so the
 * audit is credential-free and never invokes codegen.
 */
import {
  type CoverageManifest,
  statusOf,
  validateManifest,
} from "./manifest.ts";

/** One audit violation. */
export interface AuditFinding {
  readonly kind:
    | "missing-entry"
    | "stale-entry"
    | "out-of-order"
    | "malformed-entry"
    | "invalid-registry";
  /** The op key involved, or `"*"` for whole-artifact findings. */
  readonly key: string;
  readonly message: string;
}

/** Per-lane status tallies — the surface coverage floors consume. */
export interface AuditCounts {
  readonly contract: { tested: number; todo: number; skip: number };
  readonly live: {
    tested: number;
    todo: number;
    skip: number;
    untestable: number;
  };
}

/** The audit's deterministic report. */
export interface AuditReport {
  readonly vendor: string;
  readonly ok: boolean;
  /** Size of the operation universe (the registry). */
  readonly operations: number;
  readonly findings: readonly AuditFinding[];
  readonly counts: AuditCounts;
  /**
   * Paste-ready manifest stubs for every `missing-entry` finding, in
   * canonical sort position. Empty when nothing is missing.
   */
  readonly stubs: string;
}

/** Inputs to the audit. */
export interface AuditOptions {
  readonly vendor: string;
  /** The generated client's `operations` registry. */
  readonly registry: readonly string[];
  /** The vendor's manifest module value (untyped: CLI-imported). */
  readonly manifest: unknown;
}

/** Render the paste-ready stub for one missing operation. */
export const renderStub = (key: string): string =>
  `  "${key}": {\n    contract: "todo",\n    live: "todo",\n  },`;

const findingOrder: Record<AuditFinding["kind"], number> = {
  "invalid-registry": 0,
  "missing-entry": 1,
  "stale-entry": 2,
  "out-of-order": 3,
  "malformed-entry": 4,
};

const compareFindings = (a: AuditFinding, b: AuditFinding): number =>
  findingOrder[a.kind] - findingOrder[b.kind] ||
  (a.key < b.key ? -1 : a.key > b.key ? 1 : 0) ||
  (a.message < b.message ? -1 : a.message > b.message ? 1 : 0);

const emptyCounts = (): AuditCounts => ({
  contract: { tested: 0, todo: 0, skip: 0 },
  live: { tested: 0, todo: 0, skip: 0, untestable: 0 },
});

/**
 * Run the audit. Pure and deterministic: identical inputs produce an
 * identical report (findings canonically sorted, no timestamps).
 */
export const auditCoverage = (options: AuditOptions): AuditReport => {
  const findings: AuditFinding[] = [];
  const counts = emptyCounts();

  // Registry sanity — a duplicate key upstream would poison every check
  // below, so it hard-fails here (fail-closed, naming the key).
  const seen = new Set<string>();
  for (const key of options.registry) {
    if (seen.has(key)) {
      findings.push({
        kind: "invalid-registry",
        key,
        message: `registry lists "${key}" more than once`,
      });
    }
    seen.add(key);
  }

  const structural = validateManifest(options.manifest);
  for (const problem of structural) {
    findings.push({
      kind: "malformed-entry",
      key: problem.key,
      message: `${problem.lane}: ${problem.problem}`,
    });
  }

  const manifest = structural.some((problem) => problem.key === "*")
    ? ({} as CoverageManifest)
    : (options.manifest as CoverageManifest);
  const manifestKeys = Object.keys(manifest);
  const manifestSet = new Set(manifestKeys);

  const missing = options.registry.filter((key) => !manifestSet.has(key));
  for (const key of missing) {
    findings.push({
      kind: "missing-entry",
      key,
      message: `operation "${key}" has no manifest entry`,
    });
  }
  for (const key of manifestKeys) {
    if (!seen.has(key)) {
      findings.push({
        kind: "stale-entry",
        key,
        message: `manifest entry "${key}" matches no operation in the registry`,
      });
    }
  }

  // Canonical order: manifest keys must appear in registry order (the
  // registry is canonically sorted at emission), so regen diffs stay
  // minimal and mechanical. Only checked once membership already agrees —
  // drift findings would double-report otherwise.
  if (missing.length === 0 && manifestKeys.length === options.registry.length) {
    const misplaced = manifestKeys.findIndex(
      (key, index) => key !== options.registry[index],
    );
    if (misplaced !== -1) {
      findings.push({
        kind: "out-of-order",
        key: manifestKeys[misplaced]!,
        message:
          `manifest keys must follow the registry's canonical order — ` +
          `"${manifestKeys[misplaced]}" is out of position ${misplaced}` +
          ` (expected "${options.registry[misplaced]}")`,
      });
    }
  }

  // Tally statuses over well-formed entries for live operations only —
  // stale or malformed entries are findings, not statistics.
  for (const key of manifestKeys) {
    if (!seen.has(key)) continue;
    if (structural.some((problem) => problem.key === key)) continue;
    const entry = manifest[key]!;
    counts.contract[statusOf(entry.contract) as "tested" | "todo" | "skip"]++;
    counts.live[statusOf(entry.live)]++;
  }

  findings.sort(compareFindings);
  return {
    vendor: options.vendor,
    ok: findings.length === 0,
    operations: options.registry.length,
    findings,
    counts,
    stubs: missing.map(renderStub).join("\n"),
  };
};
