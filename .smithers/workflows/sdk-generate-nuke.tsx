/** @jsxImportSource smithers-orchestrator */
import * as fs from "node:fs";
import * as path from "node:path";
import { CodexAgent, Sequence, createSmithers } from "smithers-orchestrator";
import { z } from "zod";
import {
  agentResult,
  artifactRoot,
  blocked,
  changedFiles,
  commandResult,
  finalReport,
  metadataPromptSection,
  packageDir,
  persist,
  readArtifact,
  run,
  skipped,
  validateExistingPackage,
} from "./sdk-shared";

const validationResult = z.object({
  ok: z.boolean(),
  skipped: z.boolean(),
  errors: z.array(z.string()),
  removedExisting: z.boolean(),
  nukeScript: z.string(),
});

const { Workflow, Task, smithers, outputs } = createSmithers({
  input: z.object({
    provider: z.string(),
    reset: z.boolean().optional(),
  }),
  validation: validationResult,
  command: commandResult,
  agentResult,
  finalReport,
});

const codex = new CodexAgent({
  sandbox: "workspace-write",
  nativeStructuredOutput: true,
  systemPrompt: [
    "You are generating resource cleanup scripts for Distilled SDKs.",
    "Follow AGENTS.md exactly.",
    "Use Effect 4 APIs from existing code; do not guess imports.",
    "Only edit the target package nuke script unless the prompt permits more.",
  ].join("\n"),
});

const prompt = (provider: string) => `
Generate a reusable nuke script for packages/${provider}/.

Write the script to packages/${provider}/scripts/nuke.ts.

${metadataPromptSection(provider)}

Requirements:
- Accept \`--dry-run\`; dry-run lists resources without deleting.
- Load dotenv/config and the SDK's CredentialsFromEnv.
- Use @effect/platform-bun BunRuntime/BunServices.
- Use effect/unstable/http/FetchHttpClient.
- Use effect/unstable/cli for CLI parsing.
- Read credentials, test setup, and operation/service files before writing.
- Enumerate every listable resource type, print resources, and delete in
  dependency order.
- Load optional packages/${provider}/nuke-config.json with exclude rules:
  \`type\`, \`ids\`, \`namePatterns\`, and \`reason\`.
- Print skipped, deleted, failed, and final summary counts.
- Continue on individual list/delete failures and report them.
- Use only dependencies already present in the repo.

After writing:
- Run \`bun packages/${provider}/scripts/nuke.ts --dry-run\`.
- Fix import/type/runtime errors. If credentials are missing, report that as
  blocked after validating the script structure as far as possible.

Return structured output with status, summary, filesChanged, and commandsRun.
`.trim();

export default smithers((ctx) => {
  const provider = ctx.input.provider;
  const reset = ctx.input.reset ?? false;
  const artifactDir = artifactRoot("sdk-generate-nuke", provider);
  const nukeScript = path.join(packageDir(provider), "scripts", "nuke.ts");
  const validation = ctx.outputMaybe(outputs.validation, { nodeId: "validate" });
  const generated = ctx.outputMaybe(outputs.agentResult, {
    nodeId: "generate-nuke",
  });
  const typecheck = ctx.outputMaybe(outputs.command, { nodeId: "typecheck" });
  const dryRun = ctx.outputMaybe(outputs.command, { nodeId: "dry-run" });

  return (
    <Workflow name="sdk-generate-nuke">
      <Sequence>
        <Task id="validate" output={outputs.validation}>
          {async () => {
            const errors = validateExistingPackage(provider);
            let removedExisting = false;
            let shouldSkip = false;
            if (fs.existsSync(nukeScript) && reset) {
              fs.rmSync(nukeScript);
              removedExisting = true;
            } else if (fs.existsSync(nukeScript)) {
              shouldSkip = true;
            }
            return persist(artifactDir, "validate", {
              ok: errors.length === 0,
              skipped: shouldSkip,
              errors,
              removedExisting,
              nukeScript,
            });
          }}
        </Task>

        {validation?.ok && !validation.skipped ? (
          <Task
            id="generate-nuke"
            output={outputs.agentResult}
            agent={codex}
            allowTools={["read", "grep", "write", "edit", "bash"]}
            timeoutMs={2 * 60 * 60 * 1000}
          >
            {prompt(provider)}
          </Task>
        ) : null}

        {generated && !typecheck ? (
          <Task id="typecheck" output={outputs.command}>
            {async () =>
              persist(
                artifactDir,
                "typecheck",
                fs.existsSync(nukeScript)
                  ? run(["bun", "run", "typecheck"], { cwd: packageDir(provider) })
                  : blocked(
                      "typecheck",
                      "Agent did not create packages/<provider>/scripts/nuke.ts.",
                    ),
              )}
          </Task>
        ) : null}

        {typecheck && !dryRun ? (
          <Task id="dry-run" output={outputs.command} timeoutMs={30 * 60 * 1000}>
            {async () =>
              persist(
                artifactDir,
                "dry-run",
                typecheck.ok
                  ? run(["bun", nukeScript, "--dry-run"], { cwd: packageDir(provider) })
                  : blocked("dry-run", "Package typecheck failed."),
              )}
          </Task>
        ) : null}

        {(validation && (!validation.ok || validation.skipped)) || dryRun ? (
          <Task id="final-report" output={outputs.finalReport}>
            {async () => {
              const validation = readArtifact<{
                ok?: boolean;
                skipped?: boolean;
                errors?: string[];
              }>(artifactDir, "validate");
              const dryRun = readArtifact<{ ok?: boolean; stderrTail?: string }>(
                artifactDir,
                "dry-run",
              );
              const requiredFollowups = [
                ...(validation?.errors ?? []),
                ...(dryRun?.ok === false ? ["Nuke dry-run failed."] : []),
              ];
              const status = validation?.skipped
                ? "skipped"
                : requiredFollowups.length === 0
                  ? "ready"
                  : validation?.ok === false || dryRun?.ok === false
                    ? "failed"
                    : "blocked";
              return persist(artifactDir, "final-report", {
                status,
                summary: validation?.skipped
                  ? `Nuke script already exists for ${provider}; skipped.`
                  : status === "ready"
                    ? `Nuke script generated for ${provider}.`
                    : `Nuke generation stopped for ${provider}.`,
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

