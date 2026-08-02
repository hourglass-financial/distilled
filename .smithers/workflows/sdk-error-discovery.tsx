/** @jsxImportSource smthrs */
import * as path from "node:path";
import { CodexAgent, Sequence, createSmithers } from "smthrs";
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
  repoRoot,
  run,
  validateExistingPackage,
} from "./sdk-shared";

const validationResult = z.object({
  ok: z.boolean(),
  errors: z.array(z.string()),
});

const { Workflow, Task, smithers, outputs } = createSmithers({
  input: z.object({
    name: z.string(),
    services: z.array(z.string()).optional(),
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
    "You are discovering and patching SDK error typing gaps in Distilled.",
    "Follow AGENTS.md exactly.",
    "Never hand-edit generated src/operations files.",
    "Use live evidence for error mapping changes; do not guess.",
  ].join("\n"),
});

const prompt = (name: string, services: readonly string[]) => {
  const pkgDir = `packages/${name}`;
  const serviceScope =
    services.length > 0
      ? `
Scope this run to these services only: ${services.join(", ")}.
Only inspect, test, and patch files related to those services.
`
      : "";
  return `
Discover undocumented API errors for ${pkgDir}/.

${metadataPromptSection(name)}

${serviceScope}
Workflow:
- Read src/errors.ts and src/client.ts first.
- Identify operations with weak or missing typed error coverage.
- Trigger real API errors with DEBUG=1 using package test infrastructure or
  scratch files under .ai-workspace.
- Patch the SDK using the package's established patch format.
- Run \`bun run generate\` after patch changes.
- Run \`bun run typecheck\` from ${pkgDir}/.
- Append discovered error class names to .ai-workspace/${name}-metadata.json.

Allowed edits:
- ${pkgDir}/patches/**
- ${pkgDir}/src/errors.ts
- ${pkgDir}/src/client.ts
- ${pkgDir}/test/** or ${pkgDir}/tests/** only for focused discovery tests or
  fixing assertions needed by this error work

Rules:
- Do not edit ${pkgDir}/src/operations/**.
- Do not assert Unknown*Error in tests.
- If credentials or permissions are missing, report the blocked operations.

Return structured output with status, summary, filesChanged, and commandsRun.
`.trim();
};

export default smithers((ctx) => {
  const services = ctx.input.services ?? [];
  const artifactDir = artifactRoot("sdk-error-discovery", ctx.input.name);
  const validation = ctx.outputMaybe(outputs.validation, { nodeId: "validate" });
  const discovery = ctx.outputMaybe(outputs.agentResult, {
    nodeId: "discover-errors",
  });
  const generate = ctx.outputMaybe(outputs.command, { nodeId: "generate" });
  const typecheck = ctx.outputMaybe(outputs.command, { nodeId: "typecheck" });

  return (
    <Workflow name="sdk-error-discovery">
      <Sequence>
        <Task id="validate" output={outputs.validation}>
          {async () => {
            const errors = validateExistingPackage(ctx.input.name, services);
            return persist(artifactDir, "validate", {
              ok: errors.length === 0,
              errors,
            });
          }}
        </Task>

        {validation?.ok ? (
          <Task
            id="discover-errors"
            output={outputs.agentResult}
            agent={codex}
            allowTools={["read", "grep", "write", "edit", "bash"]}
            timeoutMs={2 * 60 * 60 * 1000}
          >
            {prompt(ctx.input.name, services)}
          </Task>
        ) : null}

        {discovery && !generate ? (
          <Task id="generate" output={outputs.command}>
            {async () =>
              persist(
                artifactDir,
                "generate",
                discovery.status === "blocked"
                  ? blocked("generate", "Error discovery reported blocked.")
                  : run(["bun", "run", "generate"], {
                      cwd: packageDir(ctx.input.name),
                    }),
              )}
          </Task>
        ) : null}

        {generate && !typecheck ? (
          <Task id="typecheck" output={outputs.command}>
            {async () =>
              persist(
                artifactDir,
                "typecheck",
                generate.ok
                  ? run(["bun", "run", "typecheck"], {
                      cwd: packageDir(ctx.input.name),
                    })
                  : blocked("typecheck", "Generation failed."),
              )}
          </Task>
        ) : null}

        {(validation && !validation.ok) || typecheck ? (
          <Task id="final-report" output={outputs.finalReport}>
            {async () => {
              const validation = readArtifact<{ ok?: boolean; errors?: string[] }>(
                artifactDir,
                "validate",
              );
              const typecheck = readArtifact<{ ok?: boolean }>(
                artifactDir,
                "typecheck",
              );
              const requiredFollowups = [
                ...(validation?.errors ?? []),
                ...(typecheck?.ok === false ? ["Package typecheck failed."] : []),
              ];
              return persist(artifactDir, "final-report", {
                status:
                  requiredFollowups.length === 0
                    ? "ready"
                    : validation?.ok === false || typecheck?.ok === false
                      ? "failed"
                      : "blocked",
                summary:
                  requiredFollowups.length === 0
                    ? `Error discovery completed for ${ctx.input.name}.`
                    : `Error discovery stopped for ${ctx.input.name}.`,
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

