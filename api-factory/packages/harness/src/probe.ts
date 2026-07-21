/**
 * Probes (#30 decision 8, discharging #29's flow-on): named, checked-in raw
 * requests whose scrubbed captures are the evidence backbone for patch
 * entries.
 *
 * A probe separates the **observation** — one raw request + capture,
 * statically reviewable, issued through core's `rawRequest()` on the
 * planner's own auth/transport path (never plain `fetch`, and never the
 * typed client: wire evidence must be pre-decode) — from its **experimental
 * context**: the world-state under which the observation is valid. Context
 * is declared, not improvised (ADR-0007):
 *
 * - `setup` creates prerequisite state with the existing primitives —
 *   `resource()` for Scope-guaranteed teardown, the vendor's *typed client*
 *   for the calls (fine for setup, forbidden for the observation),
 *   `resourceName()` naming — and returns a params record.
 * - `envParams` binds params to env vars for dashboard-seeded state, so a
 *   fixture id is never hard-coded into a checked-in spec (#30 d9).
 * - `request` is a pure template over the resolved params; with no params
 *   it stays a plain static request.
 *
 * A spec lives in `vendors/<v>/probes/<id>.ts` (one spec per file, filename
 * = id, default export via {@link defineProbe}) — agent-writable and
 * individually runnable. Captures land in `vendors/<v>/evidence/<id>.json`
 * with param values normalized to `<name>` placeholders (recaptures diff
 * clean) and every param's provenance recorded. Scrubbing stays automatic
 * and unconditional: secret-shaped keys and any value carrying the API key
 * are replaced before a capture ever touches disk.
 *
 * This module (the `/probe` subpath) is importable outside vitest; it also
 * re-exports the primitives a spec's `setup` needs.
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {
  makeRawRequest,
  type RawRequestOptions,
  type RawResponse,
  type RawTransportError,
} from "@hourglass-financial/api-factory-core";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import { HttpClient } from "effect/unstable/http/HttpClient";
import type { Scope } from "effect/Scope";
import type { VendorEnv } from "./env.ts";

// Everything a spec file's `setup` needs, importable without the barrel's
// runtime vitest dependency.
export { resourceName, testRunId } from "./naming.ts";
export { resource } from "./resource.ts";

/** Params a probe's observation request is templated over. */
export type ProbeParams = Readonly<Record<string, string>>;

/** A named, checked-in raw-request spec. */
export interface ProbeSpec<P extends ProbeParams = ProbeParams> {
  /** Unique-in-vendor kebab-case id; must match the spec's filename. */
  readonly id: string;
  /** What evidence this probe captures, one sentence. */
  readonly title: string;
  /**
   * Params bound to env vars (`param name → env var`): dashboard-seeded
   * fixture ids and other workspace state that must never be checked in. A
   * missing var is a named refusal, not a fallback — unless the operator
   * supplies the param via `--param`.
   */
  readonly envParams?: Readonly<Record<string, string>>;
  /**
   * Prerequisite state, built from `resource()` + the vendor's typed client
   * and returning the params it created. Runs in the probe's own Scope:
   * teardown is LIFO, after the capture is written, on failure too. A spec
   * provides its own layers (e.g. `Effect.provide(layerFromEnv)`) so the
   * probe stays individually runnable; only `Scope` may remain.
   */
  readonly setup?: Effect.Effect<P, unknown, Scope>;
  /**
   * The observation: a static raw request, or a pure template over the
   * resolved params. Auth comes from the vendor env, never from the spec.
   */
  readonly request:
    | RawRequestOptions
    | ((params: P & ProbeParams) => RawRequestOptions);
  /** Extra body/header key substrings to scrub beyond the defaults. */
  readonly scrubKeys?: readonly string[];
}

/** Identity helper that pins the spec type at the definition site. */
export const defineProbe = <P extends ProbeParams = ProbeParams>(
  spec: ProbeSpec<P>,
): ProbeSpec<P> => spec;

/** A probe run that could not start (as opposed to failing on the wire). */
export class ProbeError extends Schema.TaggedErrorClass<ProbeError>()(
  "ProbeError",
  { message: Schema.String },
) {}

/** Where a resolved param came from: `"setup"`, `"cli"`, or `"env:VAR"`. */
export type ProbeParamSource = string;

/** The scrubbed, disk-ready record of one probe run. */
export interface ProbeCapture {
  readonly probe: string;
  readonly title: string;
  readonly vendor: string;
  /** Capture date (UTC, YYYY-MM-DD) — patch provenance needs it. */
  readonly capturedAt: string;
  /**
   * Experimental-context provenance: each param's source. Values never
   * appear here — throughout the capture they are the `<name>` placeholders.
   */
  readonly context?: {
    readonly params: Readonly<Record<string, ProbeParamSource>>;
  };
  readonly request: {
    readonly method: string;
    readonly pathTemplate: string;
    readonly pathParams?: Readonly<Record<string, unknown>>;
    readonly query?: Readonly<Record<string, unknown>>;
    readonly headers?: Readonly<Record<string, unknown>>;
    readonly body?: unknown;
  };
  readonly response: {
    readonly status: number;
    readonly headers: Readonly<Record<string, unknown>>;
    readonly body: unknown;
  };
}

/** Result of {@link runProbe}: the capture plus where it was written. */
export interface ProbeResult {
  readonly capture: ProbeCapture;
  /** Absolute path of the evidence file, when `evidenceDir` was given. */
  readonly evidencePath: string | undefined;
}

const DEFAULT_SCRUB_KEYS = [
  "token",
  "secret",
  "password",
  "apikey",
  "api_key",
  "api-key",
  "authorization",
  "cookie",
  "signature",
  "private",
] as const;

export const SCRUBBED = "[scrubbed]";

const keyMatches = (key: string, patterns: readonly string[]): boolean => {
  const lowered = key.toLowerCase();
  return patterns.some((pattern) => lowered.includes(pattern));
};

/**
 * Recursively scrub a JSON-shaped value: any field whose key contains a
 * secret-shaped substring is replaced wholesale, and any string containing
 * one of `secretValues` is replaced wherever it appears (defense in depth —
 * an echoed credential scrubs even under an innocent key).
 */
export const scrubValue = (
  value: unknown,
  extraKeys: readonly string[],
  secretValues: readonly string[],
): unknown => {
  const patterns = [...DEFAULT_SCRUB_KEYS, ...extraKeys].map((pattern) =>
    pattern.toLowerCase(),
  );
  const scrub = (node: unknown): unknown => {
    if (typeof node === "string") {
      return secretValues.some(
        (secret) => secret.length > 0 && node.includes(secret),
      )
        ? SCRUBBED
        : node;
    }
    if (Array.isArray(node)) return node.map(scrub);
    if (typeof node === "object" && node !== null) {
      const result: Record<string, unknown> = {};
      for (const [key, child] of Object.entries(node)) {
        result[key] = keyMatches(key, patterns) ? SCRUBBED : scrub(child);
      }
      return result;
    }
    return node;
  };
  return scrub(value);
};

/**
 * Minimum length a param value must have to be placeholder-normalized.
 * Run-unique names and ids are always long; a pathologically short value
 * (`"5"`, `"eu"`) would substring-replace all over the capture.
 */
const MIN_NORMALIZED_LENGTH = 4;

/**
 * Replace every occurrence of each param's *value* with its `<name>`
 * placeholder, recursively. Ephemeral state — run-unique names, created and
 * seeded ids — thereby never reaches checked-in evidence, and a recapture
 * under fresh state byte-matches the old one unless the wire genuinely
 * drifted. Longer values substitute first so overlapping values cannot
 * corrupt each other.
 */
export const normalizeParams = (
  value: unknown,
  params: ProbeParams,
): unknown => {
  const substitutions = Object.entries(params)
    .filter(([, paramValue]) => paramValue.length >= MIN_NORMALIZED_LENGTH)
    .sort(([, a], [, b]) => b.length - a.length);
  if (substitutions.length === 0) return value;
  const normalize = (node: unknown): unknown => {
    if (typeof node === "string") {
      let result = node;
      for (const [name, paramValue] of substitutions) {
        result = result.split(paramValue).join(`<${name}>`);
      }
      return result;
    }
    if (Array.isArray(node)) return node.map(normalize);
    if (typeof node === "object" && node !== null) {
      const result: Record<string, unknown> = {};
      for (const [key, child] of Object.entries(node)) {
        result[key] = normalize(child);
      }
      return result;
    }
    return node;
  };
  return normalize(value);
};

const sortRecord = (
  record: Readonly<Record<string, unknown>>,
): Readonly<Record<string, unknown>> => {
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(record).sort()) sorted[key] = record[key];
  return sorted;
};

/**
 * The slice of a {@link VendorEnv} a probe needs — base credentials,
 * endpoint, and env-var reads. Every `VendorEnv<Caps>` satisfies it
 * structurally.
 */
export type ProbeEnv = Pick<
  VendorEnv,
  "vendor" | "live" | "apiKey" | "apiKeyVar" | "baseUrl" | "value"
>;

/** Options for {@link runProbe}. */
export interface RunProbeOptions {
  /** The vendor env supplying credentials and base URL. Must be live. */
  readonly env: ProbeEnv;
  /**
   * Directory to write `<id>.json` into (`vendors/<v>/evidence/`), created
   * if absent. Omit to capture without writing (tests).
   */
  readonly evidenceDir?: string;
  /**
   * Operator-supplied params (the CLI's `--param k=v`). Override
   * env-resolved params; overridden by what `setup` returns.
   */
  readonly params?: ProbeParams;
}

/** Everything {@link buildCapture} folds into one capture. */
export interface CaptureInputs {
  readonly id: string;
  readonly title: string;
  readonly vendor: string;
  /** The resolved observation request actually sent. */
  readonly request: RawRequestOptions;
  readonly response: RawResponse;
  /** Resolved params; their values become `<name>` placeholders. */
  readonly params?: ProbeParams;
  /** Param provenance: name → `"setup" | "cli" | "env:VAR"`. */
  readonly sources?: Readonly<Record<string, ProbeParamSource>>;
  readonly scrubKeys?: readonly string[];
  readonly secretValues: readonly string[];
  readonly capturedAt: string;
}

/** Build the normalized, scrubbed capture for a completed probe request. */
export const buildCapture = (inputs: CaptureInputs): ProbeCapture => {
  const params = inputs.params ?? {};
  const clean = (value: unknown): unknown =>
    scrubValue(
      normalizeParams(value, params),
      inputs.scrubKeys ?? [],
      inputs.secretValues,
    );
  const { request, response, sources } = inputs;
  return {
    probe: inputs.id,
    title: inputs.title,
    vendor: inputs.vendor,
    capturedAt: inputs.capturedAt,
    ...(sources !== undefined &&
      Object.keys(sources).length > 0 && {
        context: { params: sortRecord(sources) as Record<string, string> },
      }),
    request: {
      method: request.method,
      pathTemplate: request.pathTemplate,
      ...(request.pathParams !== undefined && {
        pathParams: clean(request.pathParams) as Readonly<
          Record<string, unknown>
        >,
      }),
      ...(request.query !== undefined && {
        query: clean(request.query) as Readonly<Record<string, unknown>>,
      }),
      ...(request.headers !== undefined && {
        headers: clean(request.headers) as Readonly<Record<string, unknown>>,
      }),
      ...(request.body !== undefined && {
        body: clean(request.body.value),
      }),
    },
    response: {
      status: response.status,
      headers: sortRecord(
        clean(response.headers) as Readonly<Record<string, unknown>>,
      ),
      body: clean(response.body),
    },
  };
};

const renderCause = (cause: unknown): string => {
  if (typeof cause === "object" && cause !== null) {
    const record = cause as { _tag?: unknown; message?: unknown };
    if (typeof record._tag === "string" && typeof record.message === "string") {
      return `${record._tag}: ${record.message}`;
    }
  }
  return String(cause);
};

/**
 * Run a probe: resolve its params (env + operator), run `setup` in a fresh
 * Scope, issue the observation through `rawRequest()`, write the normalized
 * scrubbed capture, then tear setup's resources down (LIFO — also on
 * failure). Requires an `HttpClient` — provide `FetchHttpClient.layer` to
 * hit the real API, or a mock in tests.
 */
export const runProbe = <P extends ProbeParams>(
  spec: ProbeSpec<P>,
  options: RunProbeOptions,
): Effect.Effect<ProbeResult, ProbeError | RawTransportError, HttpClient> =>
  Effect.scoped(
    Effect.gen(function* () {
      const { env } = options;
      if (env.apiKey === undefined) {
        return yield* Effect.fail(
          new ProbeError({
            message: `probe "${spec.id}" needs live credentials — set ${env.apiKeyVar}`,
          }),
        );
      }

      // Declared env params resolve before setup, so nothing gets created
      // when the run is doomed; every unresolved param is named at once.
      const resolved: Record<string, string> = {};
      const sources: Record<string, ProbeParamSource> = {};
      const missing: string[] = [];
      for (const [name, envVar] of Object.entries(spec.envParams ?? {})) {
        const override = options.params?.[name];
        const fromEnv = env.value(envVar);
        if (override !== undefined) {
          resolved[name] = override;
          sources[name] = "cli";
        } else if (fromEnv !== undefined && fromEnv.length > 0) {
          resolved[name] = fromEnv;
          sources[name] = `env:${envVar}`;
        } else {
          missing.push(`"${name}" (set ${envVar} or pass --param ${name}=…)`);
        }
      }
      if (missing.length > 0) {
        return yield* Effect.fail(
          new ProbeError({
            message: `probe "${spec.id}" is missing params: ${missing.join(", ")}`,
          }),
        );
      }
      for (const [name, value] of Object.entries(options.params ?? {})) {
        if (resolved[name] === undefined) {
          resolved[name] = value;
          sources[name] = "cli";
        }
      }

      const setupParams: ProbeParams = spec.setup
        ? yield* Effect.mapError(
            spec.setup,
            (cause) =>
              new ProbeError({
                message: `probe "${spec.id}" setup failed: ${renderCause(cause)}`,
              }),
          )
        : {};
      for (const [name, value] of Object.entries(setupParams)) {
        resolved[name] = value;
        sources[name] = "setup";
      }

      const request =
        typeof spec.request === "function"
          ? spec.request(resolved as P & ProbeParams)
          : spec.request;

      const http = yield* HttpClient;
      const rawRequest = makeRawRequest({
        http,
        baseUrl: env.baseUrl,
        apiKey: env.apiKey,
      });
      const response = yield* rawRequest(request);
      const capture = buildCapture({
        id: spec.id,
        title: spec.title,
        vendor: env.vendor,
        request,
        response,
        params: resolved,
        sources,
        scrubKeys: spec.scrubKeys,
        secretValues: [Redacted.value(env.apiKey)],
        capturedAt: new Date().toISOString().slice(0, 10),
      });

      if (options.evidenceDir === undefined) {
        return { capture, evidencePath: undefined };
      }
      const evidencePath = path.resolve(options.evidenceDir, `${spec.id}.json`);
      yield* Effect.tryPromise({
        try: async () => {
          await fs.mkdir(path.dirname(evidencePath), { recursive: true });
          await fs.writeFile(
            evidencePath,
            `${JSON.stringify(capture, null, 2)}\n`,
          );
        },
        catch: (cause) =>
          new ProbeError({
            message: `failed to write evidence ${evidencePath}: ${String(cause)}`,
          }),
      });
      return { capture, evidencePath };
    }),
  );
