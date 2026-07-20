/**
 * `@hourglass-financial/api-factory-harness` — the shared test kit every
 * vendor suite builds on (#30). Never published; imported by
 * `vendors/<v>/tests/` and `vendors/<v>/probes/`.
 *
 * - Wrappers: `contractTest` / `makeLiveTest` — op-key title stamping,
 *   capability-gated visible skips, Scope provision, 30s live timeout.
 * - Primitives: `resource()` (acquireRelease cleanup), `testRunId`,
 *   `resourceName()`, `uniqueEmail()`, `eventually()`.
 * - Environment: `defineEnv()` — capability-declared vendor env.
 * - Coverage: `CoverageManifest`, `auditCoverage()` (+ CLI at
 *   `coverage/cli.ts`), `coverageSuite()`, `HarnessCoverageReporter`.
 * - Probes: `defineProbe`, `runProbe` (+ CLI at `probe-cli.ts`).
 *
 * The two CLIs are deliberately not re-exported here: they are `bun`-run
 * entry points, and this barrel stays importable outside a vitest context.
 */

// Run-unique naming.
export { resourceName, testRunId, uniqueEmail } from "./naming.ts";

// Scope-based resource lifecycle.
export { resource } from "./resource.ts";

// Bounded polling for asynchronously-settling state.
export { eventually, type EventuallyOptions } from "./eventually.ts";

// Capability-declared vendor environment.
export { defineEnv, type EnvSpec, type VendorEnv } from "./env.ts";

// Op-key title stamps (shared by wrappers, projection, and reporter).
export {
  type Covers,
  gatedSuffix,
  type Lane,
  parseGated,
  parseStamps,
  type Stamp,
  stampSuffix,
} from "./stamp.ts";

// Test wrappers.
export {
  type ContractSpec,
  contractTest,
  LIVE_TIMEOUT,
  type LiveSpec,
  type LiveTest,
  type LiveTestConfig,
  makeLiveTest,
} from "./testkit.ts";

// Coverage manifest type + validation.
export {
  type ContractStatus,
  type CoverageEntry,
  type CoverageManifest,
  type EntryProblem,
  type LiveStatus,
  type ReasonedStatus,
  statusOf,
  validateManifest,
} from "./coverage/manifest.ts";

// Coverage audit (structure + drift; floors are workflow policy).
export {
  auditCoverage,
  type AuditCounts,
  type AuditFinding,
  type AuditOptions,
  type AuditReport,
  renderStub,
} from "./coverage/audit.ts";

// Every-run projection onto native vitest todo/skip states.
export { coverageSuite, type CoverageSuiteOptions } from "./coverage/suite.ts";

// The `tested`-claims cross-check reporter.
export {
  crossCheckTested,
  type CrossCheckResult,
  HarnessCoverageReporter,
  type HarnessCoverageReporterOptions,
  observe,
  type TestObservation,
} from "./coverage/reporter.ts";

// Probes + evidence captures.
export {
  buildCapture,
  defineProbe,
  type ProbeCapture,
  type ProbeEnv,
  ProbeError,
  type ProbeResult,
  type ProbeSpec,
  type RunProbeOptions,
  runProbe,
  SCRUBBED,
  scrubValue,
} from "./probe.ts";
