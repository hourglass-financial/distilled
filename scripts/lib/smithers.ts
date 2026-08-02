import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { Data, Effect } from "effect";

export class SmithersWorkflowError extends Data.TaggedError(
  "SmithersWorkflowError",
)<{
  readonly workflow: string;
  readonly code: number;
}> {}

export const runSmithersWorkflow = (
  workflow: string,
  input: unknown,
  cwd: string,
): Effect.Effect<void, SmithersWorkflowError> =>
  Effect.callback<void, SmithersWorkflowError>((resume) => {
    const cp = spawn(
      "bunx",
      [
        "smthrs",
        "workflow",
        "run",
        workflow,
        "--input",
        JSON.stringify(input),
      ],
      {
        cwd,
        stdio: "inherit",
        shell: false,
      },
    );

    cp.on("close", (code: number | null) => {
      const exitCode = code ?? 1;
      if (exitCode === 0) {
        resume(Effect.void);
      } else {
        resume(
          Effect.fail(
            new SmithersWorkflowError({ workflow, code: exitCode }),
          ),
        );
      }
    });
    cp.on("error", () => {
      resume(
        Effect.fail(new SmithersWorkflowError({ workflow, code: 1 })),
      );
    });
  });

export const assertSmithersFinalReport = (
  root: string,
  ...parts: string[]
): Effect.Effect<void, SmithersWorkflowError> =>
  Effect.try({
    try: () => {
      const file = path.join(
        root,
        ".ai-workspace",
        ...parts,
        "final-report.json",
      );
      if (!fs.existsSync(file)) return;
      const parsed = JSON.parse(fs.readFileSync(file, "utf-8")) as {
        status?: string;
      };
      if (parsed.status === "failed" || parsed.status === "blocked") {
        throw new SmithersWorkflowError({
          workflow: parts.join("/"),
          code: 1,
        });
      }
    },
    catch: (error) =>
      error instanceof SmithersWorkflowError
        ? error
        : new SmithersWorkflowError({
            workflow: parts.join("/"),
            code: 1,
          }),
  });
