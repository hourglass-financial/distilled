/** @jsxImportSource smithers-orchestrator */
import * as fs from "node:fs";
import * as path from "node:path";
import { CodexAgent, Sequence, createSmithers } from "smithers-orchestrator";
import { z } from "zod";
import {
  agentResult,
  artifactRoot,
  changedFiles,
  commandResult,
  finalReport,
  hasGeneratedOperations,
  packageDir,
  persist,
  readArtifact,
  repoRoot,
  run,
  skipped,
} from "./sdk-shared";

const { Workflow, Task, smithers, outputs } = createSmithers({
  input: z.object({
    name: z.string(),
    specs: z.array(z.string()).optional(),
    registerPackage: z.boolean().optional(),
    note: z.string().optional(),
    referencePackage: z.string().optional(),
    liveSmoke: z.boolean().optional(),
    maxRefineAttempts: z.number().int().positive().optional(),
  }),
  command: commandResult,
  agentResult,
  finalReport,
});

const codex = new CodexAgent({
  sandbox: "workspace-write",
  nativeStructuredOutput: true,
  systemPrompt: [
    "You are creating a new SDK package in the Distilled repository.",
    "Follow AGENTS.md exactly.",
    "Do not hand-edit generated src/operations files except by fixing generators and regenerating.",
    "Only edit files in the target package unless the prompt explicitly allows otherwise.",
    "If the vendor spec is ambiguous, record the ambiguity instead of guessing.",
  ].join("\n"),
});

const createArgs = (input: {
  name: string;
  specs?: string[];
  registerPackage?: boolean;
  note?: string;
}) => {
  const args = ["scripts/create-sdk.ts", input.name];
  for (const spec of input.specs ?? []) {
    args.push("--specs", spec);
  }
  if (input.registerPackage) args.push("--register-package");
  if (input.note?.trim()) args.push("--note", input.note.trim());
  return args;
};

const inferReferencePackage = (
  name: string,
  note?: string,
  explicit?: string,
): string | undefined => {
  const trimmed = explicit?.trim();
  if (trimmed) return trimmed.replace(/^@distilled\.cloud\//, "");

  const text = note ?? "";
  const packagePath = text.match(/packages\/([a-z0-9][a-z0-9-]*)\b/i)?.[1];
  if (packagePath) return packagePath;

  const packageName = text.match(
    /@distilled\.cloud\/([a-z0-9][a-z0-9-]*)\b/i,
  )?.[1];
  if (packageName) return packageName;

  const smokeBase = name.match(/^(.+)-smoke$/)?.[1];
  if (smokeBase && fs.existsSync(path.join(repoRoot, "packages", smokeBase))) {
    return smokeBase;
  }

  return undefined;
};

const portReferencePatches = (name: string, referencePackage?: string) => {
  const command = ["deterministic", "port-reference-patches", name];
  const reference = inferReferencePackage(name, undefined, referencePackage);
  if (!reference) {
    return skipped(
      "port-reference-patches",
      "No reference package was supplied or inferred.",
    );
  }
  if (reference === name) {
    return skipped(
      "port-reference-patches",
      "Reference package is the target package.",
    );
  }

  const refPatches = path.join(repoRoot, "packages", reference, "patches");
  const targetPatches = path.join(repoRoot, "packages", name, "patches");
  if (!fs.existsSync(refPatches)) {
    return skipped(
      "port-reference-patches",
      `Reference package ${reference} has no patches directory.`,
    );
  }

  const patchFiles = fs
    .readdirSync(refPatches)
    .filter((entry) => entry.endsWith(".json"))
    .sort();
  if (patchFiles.length === 0) {
    return skipped(
      "port-reference-patches",
      `Reference package ${reference} has no JSON patch files.`,
    );
  }

  fs.mkdirSync(targetPatches, { recursive: true });

  const copied: string[] = [];
  for (const file of patchFiles) {
    const source = path.join(refPatches, file);
    const target = path.join(targetPatches, file);
    const sourceText = fs.readFileSync(source, "utf-8");
    const targetText = fs.existsSync(target)
      ? fs.readFileSync(target, "utf-8")
      : undefined;
    if (targetText !== sourceText) {
      fs.writeFileSync(target, sourceText, "utf-8");
      copied.push(file);
    }
  }

  if (copied.length === 0) {
    return {
      command,
      cwd: repoRoot,
      exitCode: 0,
      ok: true,
      stdoutTail: `Reference patches already match ${reference}: ${patchFiles.join(", ")}`,
      stderrTail: "",
    };
  }

  const generated = run(["bun", "run", "generate"], {
    cwd: path.join(repoRoot, "packages", name),
  });
  return {
    ...generated,
    command,
    stdoutTail: [
      `Copied reference patch file(s) from ${reference}: ${copied.join(", ")}`,
      generated.stdoutTail,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};

const liveSmokeScript = (name: string): string => `
import { Effect } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import * as fs from "node:fs";
import { CredentialsFromEnv } from "../../../packages/${name}/src/credentials.ts";
import * as Ops from "../../../packages/${name}/src/operations/index.ts";

const Main = Layer.merge(CredentialsFromEnv, FetchHttpClient.layer);
const dir = "packages/${name}/src/operations";
const files = fs.readdirSync(dir).filter((file) => file.endsWith(".ts") && file !== "index.ts");
const targets = files.flatMap((file) => {
  const text = fs.readFileSync(\`\${dir}/\${file}\`, "utf8");
  const operationName = file.replace(/\\.ts$/, "");
  if (!operationName.startsWith("list")) return [];
  if (!text.includes('method: "GET"')) return [];
  if (text.includes("T.PathParam()")) return [];
  const args = text.includes("page_size") ? { page_size: 5 } : {};
  return [{ name: operationName, args }];
}).sort((a, b) => a.name.localeCompare(b.name));

if (targets.length === 0) {
  throw new Error("No read-only list operations found for live smoke.");
}

const results = [];
for (const target of targets) {
  try {
    const fn = Ops[target.name];
    if (typeof fn !== "function") {
      throw new Error(\`Operation export missing: \${target.name}\`);
    }
    const value = await Effect.runPromise(fn(target.args).pipe(Effect.provide(Main)));
    const summary = value && typeof value === "object" && "data" in value
      ? {
          dataCount: Array.isArray(value.data) ? value.data.length : null,
          hasMore: value.has_more ?? null,
        }
      : { type: typeof value };
    results.push({ name: target.name, ok: true, summary });
  } catch (error) {
    const e = error && typeof error === "object" ? error : {};
    results.push({
      name: target.name,
      ok: false,
      error: {
        tag: e._tag,
        message: e.message,
        code: e.code,
        body: e.body,
      },
    });
  }
}

const failed = results.filter((result) => !result.ok);
console.log(JSON.stringify({
  targetCount: targets.length,
  passed: results.length - failed.length,
  failed: failed.length,
  failures: failed,
}, null, 2));
if (failed.length > 0) process.exit(1);
`;

const writeLiveSmokeScript = (artifactDir: string, name: string): string => {
  fs.mkdirSync(artifactDir, { recursive: true });
  const file = path.join(artifactDir, "live-readonly-smoke.ts");
  fs.writeFileSync(file, liveSmokeScript(name), "utf-8");
  return path.relative(repoRoot, file);
};

const refinePrompt = (
  name: string,
  specs: readonly string[],
  note?: string,
) => {
  const capitalName = name
    .split(/[-_]/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  const noteSection = note?.trim()
    ? `
## User Note

${note.trim()}
`
    : "";
  return `
Refine the newly scaffolded ${capitalName} SDK at packages/${name}/.

The deterministic scaffold already created package boilerplate, specs, workflows,
and a placeholder or initial generator. The spec source(s) supplied to the
pipeline were:
${specs.length > 0 ? specs.map((spec) => `- ${spec}`).join("\n") : "- none"}
${noteSection}
Your responsibilities:
- Inspect packages/${name}/specs/ first and use those files as authoritative.
- If the user note names a reference package or an existing SDK is clearly the
  same vendor/API family, inspect that package's patches/ directory and port
  still-needed spec patches into packages/${name}/patches/. The generator must
  consume those patches; do not hand-edit generated operation files to copy the
  patched output.
- Replace packages/${name}/scripts/generate.ts with a working generator for the
  actual spec format, following existing SDK patterns.
- Run \`bun run generate\` from packages/${name}/ until src/operations or
  src/services contains real operations.
- Update packages/${name}/src/credentials.ts, src/client.ts, and src/errors.ts
  to match the real API base URL, auth scheme, and error response shape.
- Create packages/${name}/README.md with install, quick start, configuration,
  error handling, and service coverage using real operation names.
- Do not create tests in this workflow.
- Do not modify packages/core or CI workflow files.
- Use .ai-workspace for scratch files.

Final verification from packages/${name}/ must include:
1. \`bun run generate\`
2. \`bun run typecheck\`
3. confirm operations/services are no longer placeholders.

Return structured output with status, summary, filesChanged, and commandsRun.
`.trim();
};

export default smithers((ctx) => {
  const artifactDir = artifactRoot("sdk-create", ctx.input.name);
  const referencePackage = inferReferencePackage(
    ctx.input.name,
    ctx.input.note,
    ctx.input.referencePackage,
  );
  const maxRefineAttempts = Math.min(ctx.input.maxRefineAttempts ?? 5, 5);
  const prepare = ctx.outputMaybe(outputs.command, { nodeId: "prepare" });
  const refineOutputs = Array.from({ length: maxRefineAttempts }, (_, i) =>
    ctx.outputMaybe(outputs.agentResult, { nodeId: `refine-${i + 1}` }),
  );
  let lastRefineIndex = -1;
  for (let i = refineOutputs.length - 1; i >= 0; i--) {
    if (refineOutputs[i]) {
      lastRefineIndex = i;
      break;
    }
  }
  const hasAnyRefine = refineOutputs.some(Boolean);
  const hasOps = hasGeneratedOperations(ctx.input.name);
  const needsRefine = prepare?.ok === true && (!hasAnyRefine || !hasOps);
  const nextRefineIndex =
    prepare?.ok === true && (!hasAnyRefine || !hasOps)
      ? lastRefineIndex + 1
      : -1;
  const canRefine = nextRefineIndex >= 0 && nextRefineIndex < maxRefineAttempts;
  const portPatches = ctx.outputMaybe(outputs.command, {
    nodeId: "port-reference-patches",
  });
  const wireEnv = ctx.outputMaybe(outputs.command, { nodeId: "wire-test-env" });
  const verify = ctx.outputMaybe(outputs.command, { nodeId: "verify" });
  const liveSmoke = ctx.outputMaybe(outputs.command, {
    nodeId: "live-readonly-smoke",
  });
  const readyForPostRefine =
    prepare?.ok === true && hasAnyRefine && hasOps && !needsRefine;

  return (
    <Workflow name="sdk-create">
      <Sequence>
        <Task id="prepare" output={outputs.command}>
          {async () =>
            persist(
              artifactDir,
              "prepare",
              run(["bun", ...createArgs(ctx.input)], {
                cwd: repoRoot,
                env: { DISTILLED_SMITHERS_CREATE_MODE: "prepare" },
              }),
            )
          }
        </Task>

        {canRefine ? (
          <Task
            id={`refine-${nextRefineIndex + 1}`}
            output={outputs.agentResult}
            agent={codex}
            allowTools={["read", "grep", "write", "edit", "bash"]}
            timeoutMs={2 * 60 * 60 * 1000}
          >
            {[
              nextRefineIndex === 0
                ? refinePrompt(
                    ctx.input.name,
                    ctx.input.specs ?? [],
                    ctx.input.note,
                  )
                : `Continue refining packages/${ctx.input.name}/. Operations are still missing or placeholder-only. Finish generator/client/credentials/errors/README work and run verification.`,
              referencePackage
                ? `Reference package for deterministic follow-up stages: packages/${referencePackage}`
                : "",
              `Target package: ${packageDir(ctx.input.name)}`,
            ]
              .filter(Boolean)
              .join("\n\n")}
          </Task>
        ) : null}

        {readyForPostRefine && !portPatches ? (
          <Task id="port-reference-patches" output={outputs.command}>
            {async () =>
              persist(
                artifactDir,
                "port-reference-patches",
                portReferencePatches(ctx.input.name, referencePackage),
              )
            }
          </Task>
        ) : null}

        {portPatches?.ok === true && !wireEnv ? (
          <Task id="wire-test-env" output={outputs.command}>
            {async () =>
              persist(
                artifactDir,
                "wire-test-env",
                run(["bun", "scripts/create-sdk.ts", ctx.input.name], {
                  cwd: repoRoot,
                  env: { DISTILLED_SMITHERS_CREATE_MODE: "wire-test-env" },
                }),
              )
            }
          </Task>
        ) : null}

        {wireEnv && !verify ? (
          <Task id="verify" output={outputs.command}>
            {async () =>
              persist(
                artifactDir,
                "verify",
                run(["bun", "run", "typecheck"], {
                  cwd: path.join(repoRoot, "packages", ctx.input.name),
                }),
              )
            }
          </Task>
        ) : null}

        {verify?.ok === true && ctx.input.liveSmoke && !liveSmoke ? (
          <Task id="live-readonly-smoke" output={outputs.command}>
            {async () => {
              const script = writeLiveSmokeScript(artifactDir, ctx.input.name);
              return persist(
                artifactDir,
                "live-readonly-smoke",
                run(["bun", script], { cwd: repoRoot }),
              );
            }}
          </Task>
        ) : null}

        {prepare &&
        (!needsRefine || !canRefine) &&
        ((verify && (!ctx.input.liveSmoke || liveSmoke)) ||
          !hasAnyRefine ||
          !prepare.ok ||
          !canRefine) ? (
          <Task id="final-report" output={outputs.finalReport}>
            {async () => {
              const prepare = readArtifact<{
                ok?: boolean;
                stdoutTail?: string;
              }>(artifactDir, "prepare");
              const portPatches = readArtifact<{
                ok?: boolean;
                stdoutTail?: string;
                stderrTail?: string;
              }>(artifactDir, "port-reference-patches");
              const wireEnv = readArtifact<{
                ok?: boolean;
                stdoutTail?: string;
                stderrTail?: string;
              }>(artifactDir, "wire-test-env");
              const verify = readArtifact<{
                ok?: boolean;
                stdoutTail?: string;
              }>(artifactDir, "verify");
              const liveSmoke = readArtifact<{
                ok?: boolean;
                stdoutTail?: string;
                stderrTail?: string;
              }>(artifactDir, "live-readonly-smoke");
              const requiredFollowups: string[] = [];
              if (!prepare?.ok)
                requiredFollowups.push("Deterministic scaffold failed.");
              if (portPatches && !portPatches.ok) {
                requiredFollowups.push(
                  `Reference patch port/regenerate failed. ${portPatches.stderrTail || portPatches.stdoutTail}`.trim(),
                );
              }
              if (!hasGeneratedOperations(ctx.input.name)) {
                requiredFollowups.push(
                  "Generated operations/services are still missing after refinement.",
                );
              }
              if (wireEnv && !wireEnv.ok) {
                requiredFollowups.push(
                  `Test environment wiring failed. ${wireEnv.stderrTail || wireEnv.stdoutTail}`.trim(),
                );
              }
              if (verify && !verify.ok) {
                requiredFollowups.push("Package typecheck failed.");
              }
              if (ctx.input.liveSmoke && liveSmoke && !liveSmoke.ok) {
                requiredFollowups.push(
                  `Read-only live smoke failed. ${liveSmoke.stderrTail || liveSmoke.stdoutTail}`.trim(),
                );
              }
              const status =
                requiredFollowups.length === 0
                  ? "ready"
                  : prepare?.ok === false ||
                      portPatches?.ok === false ||
                      wireEnv?.ok === false ||
                      verify?.ok === false ||
                      liveSmoke?.ok === false
                    ? "failed"
                    : "blocked";
              return persist(artifactDir, "final-report", {
                status,
                summary:
                  status === "ready"
                    ? `SDK create workflow completed for ${ctx.input.name}.`
                    : `SDK create workflow stopped for ${ctx.input.name}.`,
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
