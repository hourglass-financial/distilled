/** @jsxImportSource smthrs */
import * as childProcess from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { CodexAgent, Sequence, createSmithers } from "smthrs";
import { z } from "zod";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const ereborDir = path.join(repoRoot, "packages", "erebor");
const artifactDir = path.join(repoRoot, ".ai-workspace", "erebor-sdk-update");

const commandResult = z.object({
  command: z.array(z.string()),
  cwd: z.string(),
  exitCode: z.number(),
  ok: z.boolean(),
  stdoutTail: z.string(),
  stderrTail: z.string(),
});

const jsonCommandResult = commandResult.extend({
  json: z.unknown().optional(),
  parseError: z.string().optional(),
});

const { Workflow, Task, smithers, outputs } = createSmithers({
  input: z.object({
    updateSpecs: z.boolean().optional(),
    runLiveTests: z.boolean().optional(),
    maxTriageIterations: z.number().int().positive().optional(),
    openPr: z.boolean().optional(),
  }),
  preflight: z.object({
    ok: z.boolean(),
    hasEreborPackage: z.boolean(),
    hasApiKey: z.boolean(),
    trackedDirtyFiles: z.array(z.string()),
    untrackedFiles: z.array(z.string()),
    notes: z.array(z.string()),
  }),
  command: commandResult,
  jsonCommand: jsonCommandResult,
  agentResult: z.object({
    status: z.enum(["changed", "unchanged", "blocked"]),
    summary: z.string(),
    filesChanged: z.array(z.string()),
    commandsRun: z.array(z.string()),
  }),
  finalReport: z.object({
    status: z.enum(["ready", "blocked", "failed"]),
    summary: z.string(),
    requiredFollowups: z.array(z.string()),
    changedFiles: z.array(z.string()),
  }),
});

const codex = new CodexAgent({
  sandbox: "workspace-write",
  nativeStructuredOutput: true,
  systemPrompt: [
    "You are updating the Erebor SDK in the Distilled repository.",
    "Follow AGENTS.md and HOURGLASS.md exactly.",
    "Never hand-edit packages/erebor/src/operations/**.",
    "Only edit files allowed by the prompt for the current task.",
    "If evidence is ambiguous, stop and explain instead of guessing.",
  ].join("\n"),
});

const tail = (text: string, max = 12_000): string =>
  text.length > max ? text.slice(text.length - max) : text;

const run = (
  command: string[],
  options: { cwd?: string; env?: Record<string, string | undefined> } = {},
) => {
  const proc = childProcess.spawnSync(command[0]!, command.slice(1), {
    cwd: options.cwd ?? repoRoot,
    env: { ...process.env, ...options.env },
    encoding: "utf-8",
    maxBuffer: 64 * 1024 * 1024,
  });

  return {
    command,
    cwd: options.cwd ?? repoRoot,
    exitCode: proc.status ?? 1,
    ok: (proc.status ?? 1) === 0,
    stdoutTail: tail(proc.stdout ?? ""),
    stderrTail: tail(proc.stderr ?? ""),
  };
};

const runJson = (command: string[], cwd = ereborDir) => {
  const result = run(command, { cwd });
  if (!result.ok) return result;
  try {
    return { ...result, json: JSON.parse(result.stdoutTail) };
  } catch (error) {
    return { ...result, parseError: (error as Error).message };
  }
};

const persist = <A,>(id: string, value: A): A => {
  fs.mkdirSync(artifactDir, { recursive: true });
  fs.writeFileSync(
    path.join(artifactDir, `${id}.json`),
    JSON.stringify(value, null, 2),
    "utf-8",
  );
  return value;
};

const readArtifact = <A,>(id: string): A | undefined => {
  const file = path.join(artifactDir, `${id}.json`);
  if (!fs.existsSync(file)) return undefined;
  return JSON.parse(fs.readFileSync(file, "utf-8")) as A;
};

const skipped = (id: string, reason: string) => ({
  command: ["skip", id],
  cwd: repoRoot,
  exitCode: 0,
  ok: true,
  stdoutTail: reason,
  stderrTail: "",
});

const blocked = (id: string, reason: string) => ({
  command: ["blocked", id],
  cwd: repoRoot,
  exitCode: 1,
  ok: false,
  stdoutTail: reason,
  stderrTail: "",
});

const gitPorcelain = (): string[] => {
  const status = run(["git", "status", "--porcelain"], { cwd: repoRoot });
  return status.stdoutTail.split(/\r?\n/).filter(Boolean);
};

const changedFiles = (): string[] =>
  gitPorcelain()
    .map((line) => line.slice(3).trim())
    .filter(Boolean)
    .sort();

const fileHasEnvKey = (file: string, key: string): boolean =>
  fs.existsSync(file) &&
  fs
    .readFileSync(file, "utf-8")
    .split(/\r?\n/)
    .some((line) => line.startsWith(`${key}=`) && line.slice(key.length + 1) !== "");

export default smithers((ctx) => {
  const updateSpecs = ctx.input.updateSpecs !== false;
  const runLiveTests = ctx.input.runLiveTests !== false;

  const patchAudit = ctx.outputMaybe(outputs.jsonCommand, {
    nodeId: "patch-audit",
  });
  const check = ctx.outputMaybe(outputs.command, { nodeId: "check" });
  const testAudit = ctx.outputMaybe(outputs.jsonCommand, { nodeId: "test-audit" });
  const liveTests = ctx.outputMaybe(outputs.command, { nodeId: "live-tests" });
  const classified = ctx.outputMaybe(outputs.jsonCommand, {
    nodeId: "classify-live-test-failures",
  });
  const classifiedJson = classified?.json as
    | { classified?: boolean; buckets?: Array<{ bucket?: string }> }
    | undefined;
  const reconcilePatches = ctx.outputMaybe(outputs.agentResult, {
    nodeId: "reconcile-patches",
  });
  const addMissingOperationTests = ctx.outputMaybe(outputs.agentResult, {
    nodeId: "add-missing-operation-tests",
  });
  const triageLiveTestFailures = ctx.outputMaybe(outputs.agentResult, {
    nodeId: "triage-live-test-failures",
  });

  const patchAuditJson = patchAudit?.json as
    | { ok?: boolean; counts?: Record<string, number>; entries?: unknown[] }
    | undefined;
  const patchAuditBlocked = patchAuditJson?.ok === false;
  const testAuditJson = testAudit?.json as
    | { ok?: boolean; missingTests?: string[]; orphanTests?: string[] }
    | undefined;
  const hasMissingTests = (testAuditJson?.missingTests?.length ?? 0) > 0;
  const liveFailed = liveTests && !liveTests.ok;
  const patchReconcilePending = patchAuditBlocked && !reconcilePatches;
  const missingTestsPending = hasMissingTests && !addMissingOperationTests;
  const liveTriageNeeded =
    classifiedJson?.classified === true &&
    (classifiedJson.buckets ?? []).some((entry) =>
      [
        "response_schema_drift",
        "unknown_error_mapping",
        "feature_not_enabled",
        "test_expectation_drift",
      ].includes(entry.bucket ?? ""),
    );
  const liveTriagePending = liveTriageNeeded && !triageLiveTestFailures;

  return (
    <Workflow name="erebor-sdk-update">
      <Sequence>
        <Task id="preflight" output={outputs.preflight}>
          {async () => {
            const status = gitPorcelain();
            const trackedDirtyFiles = status
              .filter((line) => !line.startsWith("?? "))
              .map((line) => line.slice(3).trim());
            const untrackedFiles = status
              .filter((line) => line.startsWith("?? "))
              .map((line) => line.slice(3).trim());
            const notes: string[] = [];
            if (untrackedFiles.some((file) => file.startsWith(".devcontainer/"))) {
              notes.push("Untracked .devcontainer files exist; leave them untouched.");
            }
            const hasApiKey =
              Boolean(process.env.EREBOR_API_KEY) ||
              fileHasEnvKey(path.join(repoRoot, ".env"), "EREBOR_API_KEY") ||
              fileHasEnvKey(path.join(ereborDir, ".env"), "EREBOR_API_KEY");
            if (!hasApiKey) {
              notes.push(
                "EREBOR_API_KEY is absent from the environment, root .env, and packages/erebor/.env; live sandbox tests will be blocked.",
              );
            }

            return persist("preflight", {
              ok: fs.existsSync(path.join(ereborDir, "package.json")),
              hasEreborPackage: fs.existsSync(path.join(ereborDir, "package.json")),
              hasApiKey,
              trackedDirtyFiles,
              untrackedFiles,
              notes,
            });
          }}
        </Task>

        <Task id="spec-update" output={outputs.command}>
          {async () =>
            persist(
              "spec-update",
              updateSpecs
                ? run(["bun", "run", "specs:update"], { cwd: ereborDir })
                : skipped("spec-update", "Spec update skipped by workflow input."),
            )}
        </Task>

        <Task id="spec-diff" output={outputs.jsonCommand}>
          {async () =>
            persist("spec-diff", runJson(["bun", "run", "specs:diff"], ereborDir))}
        </Task>

        <Task id="patch-audit" output={outputs.jsonCommand}>
          {async () =>
            persist(
              "patch-audit",
              runJson(["bun", "run", "patches:audit"], ereborDir),
            )}
        </Task>

        <Task id="build-core" output={outputs.command}>
          {async () => {
            const audit = readArtifact<{ json?: { ok?: boolean } }>("patch-audit");
            return persist(
              "build-core",
              audit?.json?.ok === false
                ? blocked(
                    "build-core",
                    "Patch audit is not clean; reconcile patches before building.",
                  )
                : run(["bun", "--filter", "@distilled.cloud/core", "build"], {
                    cwd: repoRoot,
                  }),
            );
          }}
        </Task>

        <Task id="generate" output={outputs.command}>
          {async () => {
            const coreBuild = readArtifact<{ ok?: boolean }>("build-core");
            const audit = readArtifact<{ json?: { ok?: boolean } }>("patch-audit");
            return persist(
              "generate",
              audit?.json?.ok === false
                ? blocked(
                    "generate",
                    "Patch audit is not clean; reconcile patches before generation.",
                  )
                : !coreBuild?.ok
                  ? blocked("generate", "Core build did not complete cleanly.")
                : run(["bun", "run", "generate"], { cwd: ereborDir }),
            );
          }}
        </Task>

        <Task id="prune-orphans" output={outputs.command}>
          {async () => {
            const generate = readArtifact<{ ok?: boolean }>("generate");
            return persist(
              "prune-orphans",
              generate?.ok
                ? run(["bun", "run", "prune-orphans"], { cwd: ereborDir })
                : blocked("prune-orphans", "Generation did not complete cleanly."),
            );
          }}
        </Task>

        <Task id="check" output={outputs.command}>
          {async () => {
            const prune = readArtifact<{ ok?: boolean }>("prune-orphans");
            return persist(
              "check",
              prune?.ok
                ? run(["bun", "run", "check"], { cwd: ereborDir })
                : blocked("check", "Orphan pruning did not complete cleanly."),
            );
          }}
        </Task>

        <Task id="test-audit" output={outputs.jsonCommand}>
          {async () => {
            const check = readArtifact<{ ok?: boolean }>("check");
            return persist(
              "test-audit",
              check?.ok
                ? runJson(["bun", "run", "tests:audit"], ereborDir)
                : {
                    ...blocked("test-audit", "Check did not complete cleanly."),
                    parseError: "Skipped JSON parse because check failed.",
                  },
            );
          }}
        </Task>

        <Task id="live-tests" output={outputs.command} timeoutMs={30 * 60 * 1000}>
          {async () => {
            const preflight = readArtifact<{ hasApiKey?: boolean }>("preflight");
            const testAudit = readArtifact<{
              json?:
              | { ok?: boolean; missingTests?: string[] }
              | undefined;
            }>("test-audit");
            const audit = testAudit?.json;
            let result;
            if (!runLiveTests) {
              result = skipped("live-tests", "Live tests skipped by workflow input.");
            } else if (!preflight?.hasApiKey) {
              result = blocked(
                "live-tests",
                "EREBOR_API_KEY is not available in the environment, root .env, or packages/erebor/.env.",
              );
            } else if (audit?.ok !== true || (audit?.missingTests?.length ?? 0) > 0) {
              result = blocked(
                "live-tests",
                "Operation test audit is not clean; fix tests before live run.",
              );
            } else {
              result = run(["bunx", "vitest", "run", "test"], { cwd: ereborDir });
            }
            fs.mkdirSync(artifactDir, { recursive: true });
            fs.writeFileSync(
              path.join(artifactDir, "live-tests.log"),
              `${result.stdoutTail}\n${result.stderrTail}`,
              "utf-8",
            );
            return persist("live-tests", result);
          }}
        </Task>

        <Task id="classify-live-test-failures" output={outputs.jsonCommand}>
          {async () => {
            const liveTests = readArtifact<{
              ok?: boolean;
              command?: string[];
              stdoutTail?: string;
            }>("live-tests");
            if (liveTests?.ok) {
              return persist("classify-live-test-failures", {
                ...skipped(
                  "classify-live-test-failures",
                  "Live tests passed or were skipped.",
                ),
                json: { classified: false, buckets: [] },
              });
            }
            const logPath = path.join(artifactDir, "live-tests.log");
            return persist(
              "classify-live-test-failures",
              runJson(["bun", "run", "tests:classify", logPath], ereborDir),
            );
          }}
        </Task>

        {patchAuditBlocked ? (
        <Task
          id="reconcile-patches"
          output={outputs.agentResult}
          agent={codex}
          allowTools={["read", "grep", "edit", "bash"]}
        >
          {[
            "Reconcile Erebor OpenAPI patch files only.",
            "Allowed edits: packages/erebor/patches/*.patch.json.",
            "Do not edit generated operations or tests.",
            "Use this deterministic patch audit JSON as the source of truth:",
            JSON.stringify(patchAuditJson, null, 2),
            "Remove redundant patches, remove or retarget stale patches only when the new OpenAPI clearly moved the same schema field, and stop if ambiguous.",
            "After edits, run: cd packages/erebor && bun run patches:audit.",
          ].join("\n\n")}
        </Task>
      ) : null}

      {hasMissingTests ? (
        <Task
          id="add-missing-operation-tests"
          output={outputs.agentResult}
          agent={codex}
          allowTools={["read", "grep", "write", "edit", "bash"]}
        >
          {[
            "Add missing Erebor operation tests only.",
            "Allowed edits: packages/erebor/test/*.test.ts.",
            "Do not edit packages/erebor/src/operations/**.",
            "Every resource name must include testRunId.",
            "Every created resource must be cleaned up with Effect.ensuring or equivalent.",
            "Use sibling tests as templates.",
            "Missing/orphan test audit:",
            JSON.stringify(testAuditJson, null, 2),
            "After edits, run: cd packages/erebor && bun run tests:audit && bun run check.",
          ].join("\n\n")}
        </Task>
      ) : null}

      {liveTriageNeeded ? (
        <Task
          id="triage-live-test-failures"
          output={outputs.agentResult}
          agent={codex}
          allowTools={["read", "grep", "write", "edit", "bash"]}
        >
          {[
            "Triage Erebor live-test failures using only the classifier output and raw log.",
            "Allowed edits by bucket:",
            "- response_schema_drift: packages/erebor/patches/*.patch.json",
            "- test_expectation_drift: packages/erebor/test/*.test.ts",
            "- feature_not_enabled: packages/erebor/test/*.test.ts using the sanctioned ctx.skip pattern",
            "- unknown_error_mapping: packages/erebor/src/client.ts and packages/erebor/src/errors.ts",
            "Do not edit generated operations.",
            "If the classifier bucket is unclassified, do not edit; report the ambiguity.",
            "Classifier output:",
            JSON.stringify(classifiedJson, null, 2),
            "Raw log: .ai-workspace/erebor-sdk-update/live-tests.log",
            "After edits, run the narrow failing test when identifiable, then cd packages/erebor && bun run generate && bun run prune-orphans && bun run check.",
          ].join("\n\n")}
        </Task>
      ) : null}

      {testAudit &&
      liveTests &&
      !patchReconcilePending &&
      !missingTestsPending &&
      !liveTriagePending ? (
        <Task id="final-report" output={outputs.finalReport}>
          {async () => {
            const check = readArtifact<{ ok?: boolean }>("check");
            const liveTests = readArtifact<{
              ok?: boolean;
              command?: string[];
              stdoutTail?: string;
            }>("live-tests");
            const requiredFollowups: string[] = [];
            if (patchAuditBlocked && !reconcilePatches) {
              requiredFollowups.push(
                "Patch audit reported stale, conflicting, or unsupported patches.",
              );
            }
            if (reconcilePatches) {
              requiredFollowups.push(
                "Patch reconciliation ran; rerun the workflow so spec diff, patch audit, generate, and check use the edited patch set.",
              );
            }
            if (hasMissingTests && !addMissingOperationTests) {
              requiredFollowups.push(
                `Missing tests: ${(testAuditJson?.missingTests ?? []).join(", ")}`,
              );
            }
            if (addMissingOperationTests) {
              requiredFollowups.push(
                "Missing operation test generation ran; rerun the workflow so test audit, check, and live tests use the edited tests.",
              );
            }
            if (check?.ok === false) {
              requiredFollowups.push("bun run check failed.");
            }
            if (
              liveTests &&
              !liveTests.ok &&
              liveTests.command?.[0] === "blocked" &&
              /EREBOR_API_KEY/.test(liveTests.stdoutTail ?? "")
            ) {
              requiredFollowups.push(
                "Set EREBOR_API_KEY in the environment, root .env, or packages/erebor/.env, then rerun with live tests enabled.",
              );
            } else if (liveTests && !liveTests.ok && !triageLiveTestFailures) {
              requiredFollowups.push(
                "Live sandbox tests failed; see classifier output and .ai-workspace/erebor-sdk-update/live-tests.log.",
              );
            }
            if (triageLiveTestFailures) {
              requiredFollowups.push(
                "Live-test triage ran; rerun the workflow so generate, check, and live tests validate the edited files.",
              );
            }
            if (!runLiveTests) {
              requiredFollowups.push("Live sandbox tests were skipped by input.");
            }

            const status =
              requiredFollowups.length === 0
                ? "ready"
                : check?.ok === false
                  ? "failed"
                  : "blocked";
            return persist("final-report", {
              status,
              summary:
                status === "ready"
                  ? "Erebor SDK update flow completed all deterministic gates."
                  : "Erebor SDK update flow stopped with deterministic follow-ups.",
              requiredFollowups,
              changedFiles: changedFiles(),
            });
          }}
        </Task>
      ) : null}
      </Sequence>
    </Workflow>
  );
});
