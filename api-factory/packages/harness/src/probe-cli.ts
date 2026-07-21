/**
 * Probe CLI — run one checked-in probe by id and write its scrubbed capture
 * into the vendor's evidence directory (#30 decision 8; the harness-tier
 * live re-verification step from #29 invokes this per probe id).
 *
 * Usage (from a vendor directory):
 *
 * ```
 * bun ../../packages/harness/src/probe-cli.ts \
 *   --probes ./probes --vendor workos \
 *   --api-key-var WORKOS_API_KEY --base-url https://api.workos.com \
 *   [--base-url-var WORKOS_API_URL] [--evidence ./evidence] \
 *   [--param k=v]... \
 *   <probe-id>
 * ```
 *
 * `--param` supplies (or overrides) a declared param by hand — seeded ids
 * belong in env vars, but an operator can substitute one for a single run.
 *
 * Exit codes: 0 captured, 1 probe failed (unresolved params, setup,
 * transport), 2 usage/credentials error. Prints the scrubbed capture to
 * stdout, the evidence path to stderr.
 */
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import * as Effect from "effect/Effect";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { defineEnv } from "./env.ts";
import { type ProbeParams, type ProbeSpec, runProbe } from "./probe.ts";

interface CliArgs {
  readonly probes: string;
  readonly vendor: string;
  readonly apiKeyVar: string;
  readonly baseUrl: string;
  readonly baseUrlVar?: string;
  readonly evidence?: string;
  readonly id: string;
  readonly params: ProbeParams;
}

const usage =
  "usage: probe-cli.ts --probes <dir> --vendor <name> --api-key-var <VAR> " +
  "--base-url <url> [--base-url-var <VAR>] [--evidence <dir>] " +
  "[--param k=v]... <probe-id>";

const FLAGS: Record<
  string,
  "probes" | "vendor" | "apiKeyVar" | "baseUrl" | "baseUrlVar" | "evidence"
> = {
  "--probes": "probes",
  "--vendor": "vendor",
  "--api-key-var": "apiKeyVar",
  "--base-url": "baseUrl",
  "--base-url-var": "baseUrlVar",
  "--evidence": "evidence",
};

const parseArgs = (argv: readonly string[]): CliArgs | undefined => {
  const values: Partial<Record<(typeof FLAGS)[string], string>> = {};
  const params: Record<string, string> = {};
  let id: string | undefined;
  let index = 0;
  while (index < argv.length) {
    const token = argv[index]!;
    const flag = FLAGS[token];
    if (flag !== undefined) {
      const value = argv[index + 1];
      if (value === undefined) return undefined;
      values[flag] = value;
      index += 2;
    } else if (token === "--param") {
      const pair = argv[index + 1];
      const equals = pair?.indexOf("=") ?? -1;
      if (pair === undefined || equals < 1) return undefined;
      params[pair.slice(0, equals)] = pair.slice(equals + 1);
      index += 2;
    } else if (!token.startsWith("--") && id === undefined) {
      id = token;
      index += 1;
    } else {
      return undefined;
    }
  }
  if (
    values.probes === undefined ||
    values.vendor === undefined ||
    values.apiKeyVar === undefined ||
    values.baseUrl === undefined ||
    id === undefined
  ) {
    return undefined;
  }
  return { ...values, id, params } as CliArgs;
};

const main = async (): Promise<number> => {
  const args = parseArgs(process.argv.slice(2));
  if (args === undefined) {
    console.error(usage);
    return 2;
  }

  const probesDir = path.resolve(process.cwd(), args.probes);
  const specPath = path.join(probesDir, `${args.id}.ts`);
  let spec: ProbeSpec;
  try {
    const module = (await import(pathToFileURL(specPath).href)) as {
      default?: ProbeSpec;
    };
    if (module.default === undefined) {
      console.error(`${specPath} must default-export a probe spec`);
      return 2;
    }
    spec = module.default;
  } catch (error) {
    console.error(`failed to load probe "${args.id}": ${String(error)}`);
    return 2;
  }
  if (spec.id !== args.id) {
    console.error(
      `probe id "${spec.id}" does not match its filename "${args.id}.ts" — rename one`,
    );
    return 2;
  }

  const env = defineEnv({
    vendor: args.vendor,
    apiKeyVar: args.apiKeyVar,
    ...(args.baseUrlVar !== undefined && { baseUrlVar: args.baseUrlVar }),
    defaultBaseUrl: args.baseUrl,
    capabilities: {},
  });
  if (!env.live) {
    console.error(
      `probe "${args.id}" needs credentials — set ${args.apiKeyVar}`,
    );
    return 2;
  }

  const evidenceDir = path.resolve(
    process.cwd(),
    args.evidence ?? path.join(args.probes, "..", "evidence"),
  );

  const exit = await Effect.runPromiseExit(
    runProbe(spec, { env, evidenceDir, params: args.params }).pipe(
      Effect.provide(FetchHttpClient.layer),
    ),
  );
  if (exit._tag === "Failure") {
    console.error(`probe "${args.id}" failed: ${String(exit.cause)}`);
    return 1;
  }
  console.log(JSON.stringify(exit.value.capture, null, 2));
  console.error(`evidence written: ${exit.value.evidencePath}`);
  return 0;
};

if (import.meta.main) process.exitCode = await main();
