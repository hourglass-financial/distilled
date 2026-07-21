/**
 * `coverageSuite()` — the manifest's every-run projection (#30, decision 5).
 *
 * Called once from a vendor test file, it (a) registers a real test asserting
 * the manifest matches the generated registry — so a stale manifest fails
 * every test run, not just the audit gate — and (b) projects every `todo`,
 * `skip`, and `untestable` entry onto vitest's native todo/skip states, so
 * the coverage picture is literal per-op lines in the run output with no
 * custom rendering. `tested` entries project nothing: the actual tests carry
 * those titles, and the reporter cross-checks them.
 */
import { describe, expect, it } from "vitest";
import { auditCoverage } from "./audit.ts";
import { type CoverageManifest, statusOf } from "./manifest.ts";

/** Inputs for {@link coverageSuite}. */
export interface CoverageSuiteOptions {
  readonly vendor: string;
  /** The generated client's `operations` registry. */
  readonly registry: readonly string[];
  /** The vendor's manifest (`coverage.ts` default export). */
  readonly manifest: CoverageManifest;
}

const reasonOf = (value: unknown): string =>
  typeof value === "object" && value !== null && "reason" in value
    ? String((value as { reason: unknown }).reason)
    : "";

/** Register the coverage projection suite. */
export const coverageSuite = (options: CoverageSuiteOptions): void => {
  describe(`coverage:${options.vendor}`, () => {
    it("manifest matches the operation registry", () => {
      const report = auditCoverage(options);
      if (!report.ok) {
        const lines = report.findings
          .map((finding) => `- ${finding.kind}: ${finding.message}`)
          .join("\n");
        const stubs =
          report.stubs === ""
            ? ""
            : `\n\nPaste-ready stubs for missing entries:\n${report.stubs}`;
        expect.fail(`coverage manifest audit failed:\n${lines}${stubs}`);
      }
    });

    for (const [key, entry] of Object.entries(options.manifest)) {
      const contract = statusOf(entry.contract);
      if (contract === "todo") {
        it.todo(`[contract:${key}] pending`);
      } else if (contract === "skip") {
        it.skip(`[contract:${key}] skipped — ${reasonOf(entry.contract)}`, () => {});
      }

      const live = statusOf(entry.live);
      if (live === "todo") {
        it.todo(`[live:${key}] pending`);
      } else if (live === "skip") {
        it.skip(`[live:${key}] skipped — ${reasonOf(entry.live)}`, () => {});
      } else if (live === "untestable") {
        it.skip(`[live:${key}] untestable — ${reasonOf(entry.live)}`, () => {});
      }
    }
  });
};
