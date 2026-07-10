import * as childProcess from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const here = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(here, "..", "..");

export const commandResult = z.object({
  command: z.array(z.string()),
  cwd: z.string(),
  exitCode: z.number(),
  ok: z.boolean(),
  stdoutTail: z.string(),
  stderrTail: z.string(),
});

export const agentResult = z.object({
  status: z.enum(["changed", "unchanged", "blocked"]),
  summary: z.string(),
  filesChanged: z.array(z.string()),
  commandsRun: z.array(z.string()),
});

export const finalReport = z.object({
  status: z.enum(["ready", "blocked", "failed", "skipped"]),
  summary: z.string(),
  requiredFollowups: z.array(z.string()),
  changedFiles: z.array(z.string()),
});

export const tail = (text: string, max = 12_000): string =>
  text.length > max ? text.slice(text.length - max) : text;

export const run = (
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

export const artifactRoot = (...parts: string[]) =>
  path.join(repoRoot, ".ai-workspace", ...parts);

export const persist = <A,>(dir: string, id: string, value: A): A => {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, `${id}.json`),
    JSON.stringify(value, null, 2),
    "utf-8",
  );
  return value;
};

export const readArtifact = <A,>(dir: string, id: string): A | undefined => {
  const file = path.join(dir, `${id}.json`);
  if (!fs.existsSync(file)) return undefined;
  return JSON.parse(fs.readFileSync(file, "utf-8")) as A;
};

export const skipped = (id: string, reason: string) => ({
  command: ["skip", id],
  cwd: repoRoot,
  exitCode: 0,
  ok: true,
  stdoutTail: reason,
  stderrTail: "",
});

export const blocked = (id: string, reason: string) => ({
  command: ["blocked", id],
  cwd: repoRoot,
  exitCode: 1,
  ok: false,
  stdoutTail: reason,
  stderrTail: "",
});

export const gitPorcelain = (): string[] => {
  const status = run(["git", "status", "--porcelain"], { cwd: repoRoot });
  return status.stdoutTail.split(/\r?\n/).filter(Boolean);
};

export const changedFiles = (): string[] =>
  gitPorcelain()
    .map((line) => line.slice(3).trim())
    .filter(Boolean)
    .sort();

export const packageDir = (name: string) =>
  path.join(repoRoot, "packages", name);

export const packageExists = (name: string) =>
  fs.existsSync(path.join(packageDir(name), "package.json"));

export const hasGeneratedOperations = (name: string): boolean => {
  const opsDir = path.join(packageDir(name), "src", "operations");
  const servicesDir = path.join(packageDir(name), "src", "services");
  if (fs.existsSync(servicesDir)) {
    return fs
      .readdirSync(servicesDir)
      .some((entry) => entry.endsWith(".ts") && entry !== "index.ts");
  }
  if (!fs.existsSync(opsDir)) return false;
  return fs
    .readdirSync(opsDir)
    .some((entry) => entry.endsWith(".ts") && entry !== "index.ts");
};

export const existingTestDir = (name: string): string | undefined => {
  const tests = path.join(packageDir(name), "tests");
  const test = path.join(packageDir(name), "test");
  if (fs.existsSync(tests)) return tests;
  if (fs.existsSync(test)) return test;
  return undefined;
};

export const validateExistingPackage = (
  name: string,
  services: readonly string[] = [],
): string[] => {
  const errors: string[] = [];
  const pkgDir = packageDir(name);
  if (!packageExists(name)) {
    errors.push(`Package "${name}" not found at ${pkgDir}.`);
    return errors;
  }
  const srcDir = path.join(pkgDir, "src");
  if (!fs.existsSync(srcDir)) {
    errors.push(`Package "${name}" has no src/ directory.`);
    return errors;
  }
  const opsDir = path.join(srcDir, "operations");
  const servicesDir = path.join(srcDir, "services");
  if (!fs.existsSync(opsDir) && !fs.existsSync(servicesDir)) {
    errors.push(`Package "${name}" has no src/operations or src/services.`);
  }
  if (services.length > 0) {
    if (!fs.existsSync(servicesDir)) {
      errors.push(`Package "${name}" does not support --service filtering.`);
    } else {
      const available = new Set(
        fs
          .readdirSync(servicesDir)
          .filter((entry) => entry.endsWith(".ts") && entry !== "index.ts")
          .map((entry) => entry.replace(/\.ts$/, "")),
      );
      const missing = services.filter((service) => !available.has(service));
      if (missing.length > 0) {
        errors.push(
          `Unknown service(s): ${missing.join(", ")}. Available: ${[...available].sort().join(", ")}`,
        );
      }
    }
  }
  return errors;
};

export const metadataPromptSection = (name: string): string => {
  const p = `.ai-workspace/${name}-metadata.json`;
  return `
## Shared SDK metadata: ${p}

Read \`${p}\` first if it exists. It is the shared cache for package layout,
auth, operations, errors, test framework, and human notes. Preserve unknown keys
when updating it. Treat \`userNote\` as high-priority user guidance.
`.trim();
};

