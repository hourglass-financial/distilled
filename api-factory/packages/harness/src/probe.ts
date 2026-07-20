/**
 * Probes (#30 decision 8, discharging #29's flow-on): named, checked-in raw
 * requests whose scrubbed captures are the evidence backbone for patch
 * entries.
 *
 * A probe spec lives in `vendors/<v>/probes/<id>.ts` (one spec per file,
 * filename = id, default export via {@link defineProbe}) — agent-writable,
 * reviewable, individually runnable. Running one issues the request through
 * core's `rawRequest()` (the planner's own auth/transport path — never plain
 * `fetch`) and writes an auto-scrubbed capture into `vendors/<v>/evidence/`,
 * where a patch entry can cite it by probe id.
 *
 * Scrubbing is automatic and unconditional — secret-shaped keys and any
 * value carrying the API key are replaced before a capture ever touches
 * disk. There is no opt-out; a probe needing more scrubbed adds keys via
 * `scrubKeys`.
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
import type { VendorEnv } from "./env.ts";

/** A named, checked-in raw-request spec. */
export interface ProbeSpec {
  /** Unique-in-vendor kebab-case id; must match the spec's filename. */
  readonly id: string;
  /** What evidence this probe captures, one sentence. */
  readonly title: string;
  /** The raw request to issue. Auth comes from the vendor env, never here. */
  readonly request: RawRequestOptions;
  /** Extra body/header key substrings to scrub beyond the defaults. */
  readonly scrubKeys?: readonly string[];
}

/** Identity helper that pins the spec type at the definition site. */
export const defineProbe = (spec: ProbeSpec): ProbeSpec => spec;

/** A probe run that could not start (as opposed to failing on the wire). */
export class ProbeError extends Schema.TaggedErrorClass<ProbeError>()(
  "ProbeError",
  { message: Schema.String },
) {}

/** The scrubbed, disk-ready record of one probe run. */
export interface ProbeCapture {
  readonly probe: string;
  readonly title: string;
  readonly vendor: string;
  /** Capture date (UTC, YYYY-MM-DD) — patch provenance needs it. */
  readonly capturedAt: string;
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

const sortRecord = (
  record: Readonly<Record<string, unknown>>,
): Readonly<Record<string, unknown>> => {
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(record).sort()) sorted[key] = record[key];
  return sorted;
};

/**
 * The slice of a {@link VendorEnv} a probe needs — base credentials and
 * endpoint only. Every `VendorEnv<Caps>` satisfies it structurally.
 */
export type ProbeEnv = Pick<
  VendorEnv,
  "vendor" | "live" | "apiKey" | "apiKeyVar" | "baseUrl"
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
}

/** Build the scrubbed capture for a completed probe request. */
export const buildCapture = (
  spec: ProbeSpec,
  vendor: string,
  response: RawResponse,
  secretValues: readonly string[],
  capturedAt: string,
): ProbeCapture => {
  const extra = spec.scrubKeys ?? [];
  const scrub = (value: unknown): unknown =>
    scrubValue(value, extra, secretValues);
  return {
    probe: spec.id,
    title: spec.title,
    vendor,
    capturedAt,
    request: {
      method: spec.request.method,
      pathTemplate: spec.request.pathTemplate,
      ...(spec.request.pathParams !== undefined && {
        pathParams: scrub(spec.request.pathParams) as Readonly<
          Record<string, unknown>
        >,
      }),
      ...(spec.request.query !== undefined && {
        query: scrub(spec.request.query) as Readonly<Record<string, unknown>>,
      }),
      ...(spec.request.headers !== undefined && {
        headers: scrub(spec.request.headers) as Readonly<
          Record<string, unknown>
        >,
      }),
      ...(spec.request.body !== undefined && {
        body: scrub(spec.request.body.value),
      }),
    },
    response: {
      status: response.status,
      headers: sortRecord(
        scrub(response.headers) as Readonly<Record<string, unknown>>,
      ),
      body: scrub(response.body),
    },
  };
};

/**
 * Run a probe: issue its raw request with the vendor's credentials, scrub
 * the capture, and (when `evidenceDir` is given) write
 * `<evidenceDir>/<id>.json`. Requires an `HttpClient` — provide
 * `FetchHttpClient.layer` to hit the real API, or a mock in tests.
 */
export const runProbe = (
  spec: ProbeSpec,
  options: RunProbeOptions,
): Effect.Effect<ProbeResult, ProbeError | RawTransportError, HttpClient> =>
  Effect.gen(function* () {
    const { env } = options;
    if (env.apiKey === undefined) {
      return yield* Effect.fail(
        new ProbeError({
          message: `probe "${spec.id}" needs live credentials — set ${env.apiKeyVar}`,
        }),
      );
    }
    const http = yield* HttpClient;
    const rawRequest = makeRawRequest({
      http,
      baseUrl: env.baseUrl,
      apiKey: env.apiKey,
    });
    const response = yield* rawRequest(spec.request);
    const capture = buildCapture(
      spec,
      env.vendor,
      response,
      [Redacted.value(env.apiKey)],
      new Date().toISOString().slice(0, 10),
    );

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
  });
