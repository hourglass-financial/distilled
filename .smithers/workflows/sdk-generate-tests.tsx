/** @jsxImportSource smthrs */
import * as fs from "node:fs";
import * as path from "node:path";
import { CodexAgent, Sequence, createSmithers } from "smthrs";
import { z } from "zod";
import {
  agentResult,
  artifactRoot,
  blocked,
  changedFiles,
  commandResult,
  existingTestDir,
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
  removed: z.number(),
});

const operationManifest = z.object({
  name: z.string(),
  file: z.string(),
  errors: z.array(z.string()).optional(),
  httpMethod: z.string().optional(),
  testFile: z.string(),
});

const { Workflow, Task, smithers, outputs } = createSmithers({
  input: z.object({
    provider: z.string(),
    operation: z.string().optional(),
    reset: z.boolean().optional(),
  }),
  validation: validationResult,
  command: commandResult,
  agentResult,
  finalReport,
});

type Operation = z.infer<typeof operationManifest>;

const codex = new CodexAgent({
  sandbox: "workspace-write",
  nativeStructuredOutput: true,
  systemPrompt: [
    "You are generating live API tests for a Distilled SDK.",
    "Follow AGENTS.md exactly.",
    "Every created resource must use testRunId and must be cleaned up.",
    "Never assert Unknown*Error; fix SDK error mapping instead.",
  ].join("\n"),
});

const resetTests = (provider: string, operation?: string): number => {
  const dir = existingTestDir(provider);
  if (!dir) return 0;
  if (operation) {
    const file = path.join(dir, `${operation}.test.ts`);
    if (fs.existsSync(file)) {
      fs.rmSync(file);
      return 1;
    }
    return 0;
  }
  let removed = 0;
  for (const entry of fs.readdirSync(dir)) {
    if (entry.endsWith(".test.ts")) {
      fs.rmSync(path.join(dir, entry));
      removed++;
    }
  }
  return removed;
};

const metadataPath = (provider: string) =>
  path.join(repoRoot, ".ai-workspace", `${provider}-metadata.json`);

const readOperations = (provider: string): Operation[] => {
  const file = metadataPath(provider);
  if (!fs.existsSync(file)) return [];
  const parsed = JSON.parse(fs.readFileSync(file, "utf-8")) as unknown;
  const raw = Array.isArray(parsed)
    ? parsed
    : (parsed as { operations?: unknown }).operations;
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry) => {
    const result = operationManifest.safeParse(entry);
    return result.success ? [result.data] : [];
  });
};

const researchPrompt = (provider: string) => `
Research the ${provider} SDK test surface. Do not write test files yet.

${metadataPromptSection(provider)}

Update .ai-workspace/${provider}-metadata.json with an \`operations\` array
containing every exported operation that needs tests. Each entry must include:
\`name\`, \`file\`, \`httpMethod\`, \`errors\`, and \`testFile\`.

Rules:
- Read package test setup and existing tests first.
- Read src/errors.ts, src/client.ts, and src/credentials.ts.
- Support both src/operations and src/services layouts.
- One operation gets one dedicated test file.
- Preserve all unrelated metadata keys.

Return structured output with status, summary, filesChanged, and commandsRun.
`.trim();

const operationPrompt = (
  provider: string,
  operation: Operation,
  reset: boolean,
) => `
Generate complete tests for ${provider} operation \`${operation.name}\`.

${metadataPromptSection(provider)}

Source: packages/${provider}/${operation.file}
Test file: packages/${provider}/${operation.testFile}
HTTP method: ${operation.httpMethod ?? "unknown"}
Expected typed errors: ${(operation.errors ?? []).join(", ") || "client-level errors"}
${reset ? "Reset mode is enabled; recreate the target test file from scratch." : ""}

Requirements:
- Write both happy-path and error-path tests.
- Include at least one error test; use Effect.flip and assert \`e._tag\`.
- Use testRunId in every resource name.
- Clean up every created resource with Effect.ensuring or equivalent.
- Do not use Effect.catchTag to swallow happy-path failures.
- The word "Unknown" must not appear in the test file.
- If an Unknown*Error appears while running tests, fix src/client.ts or patches,
  regenerate if needed, then assert the proper typed error.
- Run the narrow test from packages/${provider}/ and fix failures.

Return structured output with status, summary, filesChanged, and commandsRun.
`.trim();

const singleOperationPrompt = (
  provider: string,
  operation: string,
  reset: boolean,
) => `
Generate complete tests for ${provider} operation \`${operation}\`.

${metadataPromptSection(provider)}

Find the operation source in packages/${provider}/src/operations or
packages/${provider}/src/services, then write or update its dedicated test file.
${reset ? "Reset mode is enabled; remove stale coverage for this operation first." : ""}

Requirements:
- Read package test setup and existing tests before writing.
- Write both happy-path and error-path tests.
- Use testRunId in every resource name.
- Clean up every created resource.
- Assert errors via Effect.flip and \`e._tag\`.
- Never assert or mention Unknown*Error; fix SDK mapping instead.
- Run the narrow test from packages/${provider}/ and fix failures.

Return structured output with status, summary, filesChanged, and commandsRun.
`.trim();

export default smithers((ctx) => {
  const provider = ctx.input.provider;
  const operation = ctx.input.operation;
  const reset = ctx.input.reset ?? false;
  const artifactDir = artifactRoot("sdk-generate-tests", provider);
  const validation = ctx.outputMaybe(outputs.validation, { nodeId: "validate" });
  const research = ctx.outputMaybe(outputs.agentResult, { nodeId: "research" });
  const single = ctx.outputMaybe(outputs.agentResult, {
    nodeId: "generate-single",
  });
  const operations =
    validation?.ok && !operation && research ? readOperations(provider) : [];
  const toGenerate = operations.filter((op) => {
    if (reset) return true;
    return !fs.existsSync(path.join(packageDir(provider), op.testFile));
  });
  const generated = toGenerate.map((op) =>
    ctx.outputMaybe(outputs.agentResult, { nodeId: `generate-${op.name}` }),
  );
  const allGenerated =
    toGenerate.length === 0 ||
    generated.length === toGenerate.length && generated.every(Boolean);
  const verify = ctx.outputMaybe(outputs.command, { nodeId: "verify-tests" });

  return (
    <Workflow name="sdk-generate-tests">
      <Sequence>
        <Task id="validate" output={outputs.validation}>
          {async () => {
            const errors = validateExistingPackage(provider);
            const removed = reset ? resetTests(provider, operation) : 0;
            return persist(artifactDir, "validate", {
              ok: errors.length === 0,
              errors,
              removed,
            });
          }}
        </Task>

        {validation?.ok && operation ? (
          <Task
            id="generate-single"
            output={outputs.agentResult}
            agent={codex}
            allowTools={["read", "grep", "write", "edit", "bash"]}
            timeoutMs={2 * 60 * 60 * 1000}
          >
            {singleOperationPrompt(provider, operation, reset)}
          </Task>
        ) : null}

        {validation?.ok && !operation ? (
          <Task
            id="research"
            output={outputs.agentResult}
            agent={codex}
            allowTools={["read", "grep", "write", "edit", "bash"]}
            timeoutMs={60 * 60 * 1000}
          >
            {researchPrompt(provider)}
          </Task>
        ) : null}

        {toGenerate.map((op) => (
          <Task
            key={op.name}
            id={`generate-${op.name}`}
            output={outputs.agentResult}
            agent={codex}
            allowTools={["read", "grep", "write", "edit", "bash"]}
            timeoutMs={2 * 60 * 60 * 1000}
          >
            {operationPrompt(provider, op, reset)}
          </Task>
        ))}

        {validation?.ok &&
        ((operation && single) || (!operation && research && allGenerated)) &&
        !verify ? (
          <Task id="verify-tests" output={outputs.command} timeoutMs={60 * 60 * 1000}>
            {async () =>
              persist(
                artifactDir,
                "verify-tests",
                run(["bun", "run", "test"], { cwd: packageDir(provider) }),
              )}
          </Task>
        ) : null}

        {(validation && !validation.ok) || verify ? (
          <Task id="final-report" output={outputs.finalReport}>
            {async () => {
              const validation = readArtifact<{ ok?: boolean; errors?: string[] }>(
                artifactDir,
                "validate",
              );
              const verify = readArtifact<{ ok?: boolean }>(
                artifactDir,
                "verify-tests",
              );
              const requiredFollowups = [
                ...(validation?.errors ?? []),
                ...(verify?.ok === false ? ["Package tests failed."] : []),
              ];
              return persist(artifactDir, "final-report", {
                status:
                  requiredFollowups.length === 0
                    ? "ready"
                    : validation?.ok === false || verify?.ok === false
                      ? "failed"
                      : "blocked",
                summary:
                  requiredFollowups.length === 0
                    ? `Test generation completed for ${provider}.`
                    : `Test generation stopped for ${provider}.`,
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
