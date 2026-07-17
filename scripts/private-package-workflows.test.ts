import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";
import { parse } from "yaml";

const workflows = [
  {
    file: ".github/workflows/publish-persona-private.yml",
    provider: "persona",
    label: "Persona",
  },
  {
    file: ".github/workflows/publish-erebor-private.yml",
    provider: "erebor",
    label: "Erebor",
  },
  {
    file: ".github/workflows/publish-workos-private.yml",
    provider: "workos",
    label: "WorkOS",
  },
] as const;

interface WorkflowStep {
  readonly name?: string;
  readonly uses?: string;
  readonly run?: string;
  readonly if?: string;
  readonly with?: Record<string, unknown>;
}

describe.each(workflows)("$file", ({ file, provider, label }) => {
  test("pins source, verifies artifacts, and protects tag promotion", async () => {
    const source = await readFile(file, "utf8");
    const workflow = parse(source);
    const dispatch = workflow.on.workflow_dispatch;
    const publishJob = workflow.jobs.publish;
    const steps = publishJob.steps as WorkflowStep[];
    const corePackage = "@hourglass-financial/distilled-core";
    const providerPackage = `@hourglass-financial/${provider}`;
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
    const smokeStep = `Smoke published ${label} pair before moving final tags`;
    const snapshotStep = stepNamed("Snapshot current final tags");
    const promotionStep = stepNamed("Move final tags");
    const rollbackStep = stepNamed(
      "Restore previous final tags after failed promotion",
    );
    const cleanupStep = stepNamed("Remove temporary run tags");

    expect(dispatch.inputs["source-sha"].required).toBe(true);
    expect(publishJob.if).toBe("github.ref == 'refs/heads/main'");
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
    expect(stepNamed(smokeStep).run).toContain(
      `smoke:github-${provider}-install --tag "$RUN_TAG" --package-manager npm`,
    );
    expect(stepNamed(smokeStep).run).toContain(
      `smoke:github-${provider}-install --tag "$RUN_TAG" --package-manager bun`,
    );
    expect(snapshotStep.run).toContain(
      "private-package-release.ts tag-version",
    );
    expect(snapshotStep.run).not.toContain("JSON.parse");
    for (const packageName of [corePackage, providerPackage]) {
      expect(snapshotStep.run).toContain(`--package ${packageName}`);
      expect(promotionStep.run).toContain(
        `"${packageName}@\${VERSION}" "$DIST_TAG"`,
      );
      expect(rollbackStep.run).toContain(`restore_tag ${packageName}`);
      expect(cleanupStep.run).toContain(packageName);
    }
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
    expect(rollbackStep.if).toContain("failure()");
    expect(cleanupStep.if).toBe("always()");
    if (provider === "workos") {
      expect(publishJob["timeout-minutes"]).toBe(30);
      expect(rollbackStep.if).toContain("cancelled()");
      expect(rollbackStep.run).toContain(
        "private-package-release.ts tag-version",
      );
      expect(cleanupStep.run).toContain(
        "private-package-release.ts tag-version",
      );
      for (const packageName of [corePackage, providerPackage]) {
        expect(cleanupStep.run).toContain(`remove_tag ${packageName}`);
      }
    }
    expect(stepNamed("Remove registry credentials").if).toBe("always()");
  });
});
