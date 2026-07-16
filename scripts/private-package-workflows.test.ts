import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";
import { parse } from "yaml";

const workflows = [
  ".github/workflows/publish-persona-private.yml",
  ".github/workflows/publish-erebor-private.yml",
] as const;

interface WorkflowStep {
  readonly name?: string;
  readonly uses?: string;
  readonly run?: string;
  readonly if?: string;
  readonly with?: Record<string, unknown>;
}

describe.each(workflows)("%s", (file) => {
  test("pins source, verifies artifacts, and protects tag promotion", async () => {
    const source = await readFile(file, "utf8");
    const workflow = parse(source);
    const dispatch = workflow.on.workflow_dispatch;
    const steps = workflow.jobs.publish.steps as WorkflowStep[];
    const stepNamed = (name: string): WorkflowStep => {
      const step = steps.find((candidate) => candidate.name === name);
      expect(step, `missing workflow step: ${name}`).toBeDefined();
      return step!;
    };
    const stepIndex = (name: string): number => {
      stepNamed(name);
      return steps.findIndex((candidate) => candidate.name === name);
    };
    const checkoutSteps = steps.filter(
      (step) =>
        typeof step.uses === "string" &&
        step.uses.startsWith("actions/checkout@"),
    );
    const provider = file.includes("persona") ? "persona" : "erebor";
    const providerLabel = provider === "persona" ? "Persona" : "Erebor";
    const smokeStep = `Smoke published ${providerLabel} pair before moving final tags`;

    expect(dispatch.inputs["source-sha"].required).toBe(true);
    expect(workflow.jobs.publish.if).toBe("github.ref == 'refs/heads/main'");
    expect(checkoutSteps).toHaveLength(1);
    expect(checkoutSteps[0].with?.ref).toBe("${{ inputs['source-sha'] }}");
    expect(checkoutSteps[0].with?.["persist-credentials"]).toBe(false);
    expect(
      stepIndex("Validate release inputs from trusted source"),
    ).toBeLessThan(stepIndex("Checkout validated release source"));
    expect(
      stepNamed("Validate release inputs from trusted source").run,
    ).toContain("compare/${SOURCE_SHA}...main");
    expect(stepNamed("Build package inputs").run).toContain(
      `bun --filter @distilled.cloud/${provider} build`,
    );
    expect(stepNamed("Build package inputs").run).not.toContain(
      "test:effect-compatibility",
    );
    expect(stepNamed("Pack immutable artifacts").run).toContain(
      "npm pack --json",
    );
    expect(stepNamed("Publish pair under temporary tag").run).toContain(
      'npm publish "${{ steps.pack.outputs.core }}"',
    );
    expect(
      stepIndex("Verify published pair before moving final tags"),
    ).toBeLessThan(stepIndex(smokeStep));
    expect(stepIndex(smokeStep)).toBeLessThan(stepIndex("Move final tags"));
    expect(stepIndex("Move final tags")).toBeLessThan(
      stepIndex("Write release receipt"),
    );
    expect(stepIndex("Write release receipt")).toBeLessThan(
      stepIndex("Upload release receipt"),
    );
    expect(stepNamed("Write release receipt").run).toContain(
      "private-package-release.ts receipt",
    );
    expect(stepNamed("Upload release receipt").uses).toBe(
      "actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02",
    );
    expect(
      stepNamed("Restore previous final tags after failed promotion").if,
    ).toContain("failure()");
    expect(stepNamed("Remove temporary run tags").if).toBe("always()");
    expect(stepNamed("Remove registry credentials").if).toBe("always()");
  });
});
