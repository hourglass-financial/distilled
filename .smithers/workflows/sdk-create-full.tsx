/** @jsxImportSource smithers-orchestrator */
import * as fs from "node:fs";
import * as path from "node:path";
import { Sequence, createSmithers } from "smithers-orchestrator";
import { z } from "zod";
import {
  artifactRoot,
  changedFiles,
  commandResult,
  finalReport,
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
    skipCreate: z.boolean().optional(),
    skipErrorDiscovery: z.boolean().optional(),
    skipTests: z.boolean().optional(),
    skipNuke: z.boolean().optional(),
    continueOnError: z.boolean().optional(),
  }),
  command: commandResult,
  finalReport,
});

const metadataFile = (name: string) =>
  path.join(repoRoot, ".ai-workspace", `${name}-metadata.json`);

const writeMetadataNote = (name: string, note: string) => {
  fs.mkdirSync(path.join(repoRoot, ".ai-workspace"), { recursive: true });
  const file = metadataFile(name);
  const existing = fs.existsSync(file)
    ? (JSON.parse(fs.readFileSync(file, "utf-8")) as Record<string, unknown>)
    : {
        name,
        pkgDir: `packages/${name}`,
        userNote: null,
        layout: null,
        testDir: null,
        framework: null,
        setupFile: null,
        baseUrl: null,
        authScheme: null,
        envVars: [],
        operations: [],
        errorClasses: [],
        notes: [],
      };
  const previous =
    typeof existing.userNote === "string" ? existing.userNote : "";
  if (previous && previous !== note) {
    const notes = Array.isArray(existing.notes) ? existing.notes : [];
    notes.push(`[previous userNote] ${previous}`);
    existing.notes = notes;
  }
  existing.userNote = note;
  fs.writeFileSync(file, JSON.stringify(existing, null, 2), "utf-8");
};

const createArgs = (input: {
  name: string;
  specs?: string[];
  registerPackage?: boolean;
  note?: string;
  referencePackage?: string;
  liveSmoke?: boolean;
}) => {
  const args = ["scripts/create-sdk.ts", input.name];
  for (const spec of input.specs ?? []) {
    args.push("--specs", spec);
  }
  if (input.registerPackage) args.push("--register-package");
  if (input.note?.trim()) args.push("--note", input.note.trim());
  if (input.referencePackage?.trim()) {
    args.push("--reference-package", input.referencePackage.trim());
  }
  if (input.liveSmoke) args.push("--live-smoke");
  return args;
};

const stageOk = (
  artifactDir: string,
  id: string,
  continueOnError: boolean,
): boolean => {
  const result = readArtifact<{ ok?: boolean }>(artifactDir, id);
  return Boolean(result) && (continueOnError || result?.ok === true);
};

export default smithers((ctx) => {
  const artifactDir = artifactRoot("sdk-create-full", ctx.input.name);
  const continueOnError = ctx.input.continueOnError ?? false;
  const note = ctx.input.note?.trim() ?? "";

  const create = ctx.outputMaybe(outputs.command, { nodeId: "create-sdk" });
  const errorDiscovery = ctx.outputMaybe(outputs.command, {
    nodeId: "error-discovery",
  });
  const generateTests = ctx.outputMaybe(outputs.command, {
    nodeId: "generate-tests",
  });
  const generateNuke = ctx.outputMaybe(outputs.command, {
    nodeId: "generate-nuke",
  });

  const createAllowsNext =
    create && stageOk(artifactDir, "create-sdk", continueOnError);
  const errorAllowsNext =
    errorDiscovery && stageOk(artifactDir, "error-discovery", continueOnError);
  const testsAllowsNext =
    generateTests && stageOk(artifactDir, "generate-tests", continueOnError);

  const stoppedAfterCreate = create && !createAllowsNext;
  const stoppedAfterError = errorDiscovery && !errorAllowsNext;
  const stoppedAfterTests = generateTests && !testsAllowsNext;

  return (
    <Workflow name="sdk-create-full">
      <Sequence>
        <Task
          id="create-sdk"
          output={outputs.command}
          timeoutMs={4 * 60 * 60 * 1000}
        >
          {async () => {
            if (ctx.input.skipCreate) {
              if (note) writeMetadataNote(ctx.input.name, note);
              return persist(
                artifactDir,
                "create-sdk",
                skipped("create-sdk", "create-sdk skipped by workflow input."),
              );
            }
            return persist(
              artifactDir,
              "create-sdk",
              run(["bun", ...createArgs(ctx.input)], { cwd: repoRoot }),
            );
          }}
        </Task>

        {createAllowsNext ? (
          <Task
            id="error-discovery"
            output={outputs.command}
            timeoutMs={3 * 60 * 60 * 1000}
          >
            {async () =>
              persist(
                artifactDir,
                "error-discovery",
                ctx.input.skipErrorDiscovery
                  ? skipped(
                      "error-discovery",
                      "error-discovery skipped by workflow input.",
                    )
                  : run(["bun", "scripts/error-discovery.ts", ctx.input.name], {
                      cwd: repoRoot,
                    }),
              )
            }
          </Task>
        ) : null}

        {errorAllowsNext ? (
          <Task
            id="generate-tests"
            output={outputs.command}
            timeoutMs={4 * 60 * 60 * 1000}
          >
            {async () =>
              persist(
                artifactDir,
                "generate-tests",
                ctx.input.skipTests
                  ? skipped(
                      "generate-tests",
                      "generate-tests skipped by workflow input.",
                    )
                  : run(["bun", "scripts/generate-tests.ts", ctx.input.name], {
                      cwd: repoRoot,
                    }),
              )
            }
          </Task>
        ) : null}

        {testsAllowsNext ? (
          <Task
            id="generate-nuke"
            output={outputs.command}
            timeoutMs={3 * 60 * 60 * 1000}
          >
            {async () =>
              persist(
                artifactDir,
                "generate-nuke",
                ctx.input.skipNuke
                  ? skipped(
                      "generate-nuke",
                      "generate-nuke skipped by workflow input.",
                    )
                  : run(["bun", "scripts/generate-nuke.ts", ctx.input.name], {
                      cwd: repoRoot,
                    }),
              )
            }
          </Task>
        ) : null}

        {generateNuke ||
        stoppedAfterCreate ||
        stoppedAfterError ||
        stoppedAfterTests ? (
          <Task id="final-report" output={outputs.finalReport}>
            {async () => {
              const stageIds = [
                "create-sdk",
                "error-discovery",
                "generate-tests",
                "generate-nuke",
              ];
              const requiredFollowups: string[] = [];
              for (const id of stageIds) {
                const result = readArtifact<{
                  ok?: boolean;
                  stdoutTail?: string;
                  stderrTail?: string;
                }>(artifactDir, id);
                if (result && !result.ok) {
                  requiredFollowups.push(
                    `${id} failed. ${result.stderrTail || result.stdoutTail}`.trim(),
                  );
                }
              }
              const status =
                requiredFollowups.length === 0 || continueOnError
                  ? "ready"
                  : "failed";
              return persist(artifactDir, "final-report", {
                status,
                summary:
                  requiredFollowups.length === 0
                    ? `Full SDK pipeline completed for ${ctx.input.name}.`
                    : continueOnError
                      ? `Full SDK pipeline completed for ${ctx.input.name} with failed stages because continueOnError is set.`
                      : `Full SDK pipeline stopped for ${ctx.input.name}.`,
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
