/**
 * The harness vitest reporter (#30, decision 5): `tested` is a verified
 * fact, not a reviewed claim.
 *
 * After the run it aggregates every test title across workers, parses the
 * op stamps back out, and fails the run when a lane's `tested` manifest
 * entry had no exercised test. Enforcement is scoped to what actually ran:
 * a claim whose only stamped tests were harness-gated skips (missing
 * credential or capability) is *unverified*, reported loudly but not a
 * failure — a credential-less run cannot certify the live lane, and a skip
 * is not verification. A claim with no stamped test at all, or whose tests
 * were disabled outside the harness gates, is a lie and fails.
 *
 * The pure core ({@link crossCheckTested}) is exported separately so the
 * audit tooling and tests share the exact check the reporter enforces.
 */
import type { Reporter, TestModule, TestRunEndReason } from "vitest/node";
import { type CoverageManifest, statusOf } from "./manifest.ts";
import { type Lane, parseGated, parseStamps } from "../stamp.ts";

/** One observed test, reduced to what the cross-check needs. */
export interface TestObservation {
  /** Full test name (suite path included) — where the stamps live. */
  readonly title: string;
  readonly state: "passed" | "failed" | "skipped" | "pending";
}

/** Cross-check outcome. */
export interface CrossCheckResult {
  /** Honesty violations — each fails the run. */
  readonly failures: readonly string[];
  /** Non-fatal observations (e.g. a test covering an op still marked todo). */
  readonly warnings: readonly string[];
  /**
   * `tested` claims excused this run by harness gating — real coverage
   * exists but the environment could not certify it.
   */
  readonly unverified: readonly string[];
}

interface StampTally {
  executed: number;
  gated: number;
  disabled: number;
}

const laneKey = (lane: Lane, key: string): string => `${lane}:${key}`;

/**
 * Verify a manifest's `tested` claims against the observed run. Pure and
 * deterministic; results are sorted for stable output.
 */
export const crossCheckTested = (
  manifest: CoverageManifest,
  observations: readonly TestObservation[],
): CrossCheckResult => {
  const tallies = new Map<string, StampTally>();
  const failures: string[] = [];
  const warnings: string[] = [];
  const unverified: string[] = [];

  for (const observation of observations) {
    const stamps = parseStamps(observation.title);
    const gated = parseGated(observation.title) !== undefined;
    for (const stamp of stamps) {
      const id = laneKey(stamp.lane, stamp.key);
      const tally = tallies.get(id) ?? { executed: 0, gated: 0, disabled: 0 };
      if (observation.state === "passed" || observation.state === "failed") {
        tally.executed++;
      } else if (gated) {
        tally.gated++;
      } else {
        tally.disabled++;
      }
      tallies.set(id, tally);

      const entry = manifest[stamp.key];
      if (entry === undefined) {
        failures.push(
          `[${id}] a test stamps operation "${stamp.key}", which is not in the coverage manifest`,
        );
      } else if (
        (observation.state === "passed" || observation.state === "failed") &&
        statusOf(entry[stamp.lane]) !== "tested"
      ) {
        warnings.push(
          `[${id}] a test ran for this operation but the manifest still says "${statusOf(entry[stamp.lane])}" — update coverage.ts`,
        );
      }
    }
  }

  for (const [key, entry] of Object.entries(manifest)) {
    for (const lane of ["contract", "live"] as const) {
      if (statusOf(entry[lane]) !== "tested") continue;
      const id = laneKey(lane, key);
      const tally = tallies.get(id);
      if (tally !== undefined && tally.executed > 0) continue;
      if (tally !== undefined && tally.gated > 0 && tally.disabled === 0) {
        unverified.push(
          `[${id}] claimed tested; its tests were gated skips this run (environment cannot certify it)`,
        );
        continue;
      }
      if (tally !== undefined && tally.disabled > 0) {
        failures.push(
          `[${id}] claimed tested, but its stamped tests were skipped outside harness gating — un-skip them or update coverage.ts`,
        );
        continue;
      }
      failures.push(
        `[${id}] claimed tested, but no test stamps this operation — the claim is stale`,
      );
    }
  }

  const sortStrings = (values: string[]): readonly string[] =>
    [...new Set(values)].sort();
  return {
    failures: sortStrings(failures),
    warnings: sortStrings(warnings),
    unverified: sortStrings(unverified),
  };
};

/** Reporter options. */
export interface HarnessCoverageReporterOptions {
  readonly vendor: string;
  /**
   * The vendor's manifest — pass the imported `coverage.ts` default export
   * (vitest configs are modules; importing it is one line), or an absolute
   * module path to import at run end.
   */
  readonly manifest: CoverageManifest | string;
}

/** Collect observations from vitest's reported task tree. */
export const observe = (
  testModules: ReadonlyArray<TestModule>,
): readonly TestObservation[] => {
  const observations: TestObservation[] = [];
  for (const testModule of testModules) {
    for (const testCase of testModule.children.allTests()) {
      observations.push({
        title: testCase.fullName,
        state: testCase.result().state,
      });
    }
  }
  return observations;
};

/**
 * The vitest reporter. Wire it in the vendor's `vitest.config.ts` — and
 * import it from the vitest-free `/reporter` subpath, because config files
 * (like probe specs) must not pull the barrel's runtime `vitest` imports:
 *
 * ```ts
 * import { HarnessCoverageReporter } from "@hourglass-financial/api-factory-harness/reporter";
 * import manifest from "./tests/coverage.ts";
 * export default defineConfig({
 *   test: {
 *     reporters: [
 *       "default",
 *       new HarnessCoverageReporter({ vendor: "workos", manifest }),
 *     ],
 *   },
 * });
 * ```
 */
export class HarnessCoverageReporter implements Reporter {
  private readonly options: HarnessCoverageReporterOptions;

  constructor(options: HarnessCoverageReporterOptions) {
    this.options = options;
  }

  async onTestRunEnd(
    testModules: ReadonlyArray<TestModule>,
    _errors: ReadonlyArray<unknown>,
    reason: TestRunEndReason,
  ): Promise<void> {
    // An interrupted run has arbitrary holes; judging claims against it
    // would fabricate staleness.
    if (reason === "interrupted") return;

    const manifest =
      typeof this.options.manifest === "string"
        ? (
            (await import(this.options.manifest)) as {
              default: CoverageManifest;
            }
          ).default
        : this.options.manifest;

    const result = crossCheckTested(manifest, observe(testModules));
    const label = `coverage cross-check (${this.options.vendor})`;

    for (const warning of result.warnings) {
      console.warn(`${label} warning: ${warning}`);
    }
    if (result.unverified.length > 0) {
      console.warn(
        `${label}: ${result.unverified.length} tested claim(s) not certified this run:\n` +
          result.unverified.map((line) => `  ${line}`).join("\n"),
      );
    }
    if (result.failures.length > 0) {
      console.error(
        `${label} FAILED:\n` +
          result.failures.map((line) => `  ${line}`).join("\n"),
      );
      process.exitCode = 1;
    }
  }
}
