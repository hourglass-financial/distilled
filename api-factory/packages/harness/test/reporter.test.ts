/**
 * The `tested`-claims cross-check: a claim is verified only by an exercised
 * stamped test; harness-gated skips excuse (but loudly), anything else
 * fails. Plus the thin vitest-reporter adapter over the pure core.
 */
import type { TestModule } from "vitest/node";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CoverageManifest } from "../src/coverage/manifest.ts";
import {
  crossCheckTested,
  HarnessCoverageReporter,
  type TestObservation,
} from "../src/coverage/reporter.ts";

const manifest: CoverageManifest = {
  "organizations.create": { contract: "tested", live: "tested" },
  "organizations.get": { contract: "tested", live: "todo" },
  "userManagement.authenticateWithPassword": {
    contract: "tested",
    live: "tested",
  },
};

const ran = (title: string): TestObservation => ({ title, state: "passed" });
const skipped = (title: string): TestObservation => ({
  title,
  state: "skipped",
});

const fullCoverage: readonly TestObservation[] = [
  ran("orgs > creates [contract:organizations.create]"),
  ran("orgs > creates live [live:organizations.create]"),
  ran("orgs > gets [contract:organizations.get]"),
  ran(
    "auth > authenticates [contract:userManagement.authenticateWithPassword]",
  ),
  ran(
    "auth > authenticates live [live:userManagement.authenticateWithPassword]",
  ),
];

describe("crossCheckTested", () => {
  it("passes when every tested claim had an exercised stamped test", () => {
    const result = crossCheckTested(manifest, fullCoverage);
    expect(result.failures).toEqual([]);
    expect(result.unverified).toEqual([]);
  });

  it("a tested claim with no stamped test at all is a failure", () => {
    const result = crossCheckTested(
      manifest,
      fullCoverage.filter(
        (o) => !o.title.includes("[live:organizations.create]"),
      ),
    );
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0]).toContain("[live:organizations.create]");
    expect(result.failures[0]).toContain("stale");
  });

  it("a failed test still counts as exercised — honesty, not greenness", () => {
    const observations = fullCoverage.map((observation) =>
      observation.title.includes("[live:organizations.create]")
        ? { ...observation, state: "failed" as const }
        : observation,
    );
    expect(crossCheckTested(manifest, observations).failures).toEqual([]);
  });

  it("a harness-gated skip excuses the claim as unverified, not a lie", () => {
    const observations = [
      ...fullCoverage.filter(
        (o) => !o.title.includes("[live:organizations.create]"),
      ),
      skipped(
        "orgs > creates live [live:organizations.create] [gated: missing WORKOS_API_KEY]",
      ),
    ];
    const result = crossCheckTested(manifest, observations);
    expect(result.failures).toEqual([]);
    expect(result.unverified).toHaveLength(1);
    expect(result.unverified[0]).toContain("[live:organizations.create]");
  });

  it("a stamped test skipped outside harness gating is a failure", () => {
    const observations = [
      ...fullCoverage.filter(
        (o) => !o.title.includes("[live:organizations.create]"),
      ),
      skipped("orgs > creates live [live:organizations.create]"),
    ];
    const result = crossCheckTested(manifest, observations);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0]).toContain("skipped outside harness gating");
  });

  it("a stamp for an op the manifest does not know is a failure (typo guard)", () => {
    const result = crossCheckTested(manifest, [
      ...fullCoverage,
      ran("orgs > lists [contract:organizations.lists]"),
    ]);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0]).toContain("organizations.lists");
  });

  it("an exercised test for a todo entry warns to update the manifest", () => {
    const result = crossCheckTested(manifest, [
      ...fullCoverage,
      ran("orgs > gets live [live:organizations.get]"),
    ]);
    expect(result.failures).toEqual([]);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('still says "todo"');
  });
});

describe("HarnessCoverageReporter", () => {
  const originalExitCode = process.exitCode;
  afterEach(() => {
    process.exitCode = originalExitCode;
    vi.restoreAllMocks();
  });

  const moduleOf = (tests: readonly TestObservation[]): TestModule =>
    ({
      children: {
        *allTests() {
          for (const test of tests) {
            yield {
              fullName: test.title,
              result: () => ({ state: test.state }),
            };
          }
        },
      },
    }) as unknown as TestModule;

  it("fails the run (exit code) when a tested claim was not exercised", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const reporter = new HarnessCoverageReporter({
      vendor: "workos",
      manifest,
    });
    await reporter.onTestRunEnd(
      [moduleOf(fullCoverage.slice(1))],
      [],
      "passed",
    );
    expect(process.exitCode).toBe(1);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("[contract:organizations.create]"),
    );
  });

  it("stays quiet on a fully-exercised run", async () => {
    const reporter = new HarnessCoverageReporter({
      vendor: "workos",
      manifest,
    });
    await reporter.onTestRunEnd([moduleOf(fullCoverage)], [], "passed");
    expect(process.exitCode).toBe(originalExitCode);
  });

  it("does not judge an interrupted run", async () => {
    const reporter = new HarnessCoverageReporter({
      vendor: "workos",
      manifest,
    });
    await reporter.onTestRunEnd([moduleOf([])], [], "interrupted");
    expect(process.exitCode).toBe(originalExitCode);
  });
});
