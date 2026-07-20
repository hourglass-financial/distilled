import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CodegenError } from "../../errors.ts";
import { printJson, type JsonValue } from "./json.ts";
import {
  PROVENANCE_FILE,
  SPEC_FILE,
  sha256,
  type ProvenanceRecord,
} from "./vendor-dir.ts";

/**
 * The acquisition command (#27 L0): the only writer of the machine-locked
 * snapshot and its provenance record. It fetches the vendor spec, converts
 * YAML sources to JSON mechanically (patches target JSON Pointers, so the
 * checked-in snapshot is always JSON), and records source URL, upstream
 * ref, fetch date, and content hashes. Everything else under the vendor
 * dir — patches, config, probes, evidence, tests — is untouched.
 */

export interface AcquireOptions {
  readonly vendorDir: string;
  readonly source: string;
  readonly upstreamRef?: string | undefined;
  /** Overrides extension-based detection when the source URL hides it. */
  readonly sourceFormat?: "json" | "yaml" | undefined;
  /** Injectable clock for tests; defaults to the current UTC instant. */
  readonly now?: (() => Date) | undefined;
  /** Injectable fetcher for tests; defaults to global fetch. */
  readonly fetchText?: ((url: string) => Promise<string>) | undefined;
}

export interface AcquisitionResult {
  readonly vendorDir: string;
  readonly specFile: string;
  readonly provenanceFile: string;
  readonly provenance: ProvenanceRecord;
}

const fail = (rule: string, construct: string, message: string): never => {
  throw new CodegenError([{ rule, construct, message }]);
};

const detectFormat = (source: string): "json" | "yaml" => {
  const path = source.split("?")[0]!;
  return path.endsWith(".yaml") || path.endsWith(".yml") ? "yaml" : "json";
};

const defaultFetchText = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    return fail(
      "acquire.fetch",
      url,
      `fetch failed with status ${response.status}`,
    );
  }
  return response.text();
};

const parseYaml = (contents: string, source: string): JsonValue => {
  const bun = (
    globalThis as {
      readonly Bun?: { readonly YAML?: { parse(text: string): unknown } };
    }
  ).Bun;
  if (bun?.YAML === undefined) {
    return fail(
      "acquire.yaml",
      source,
      "YAML sources require the Bun runtime (Bun.YAML); run the acquisition command with bun",
    );
  }
  try {
    return bun.YAML.parse(contents) as JsonValue;
  } catch (cause) {
    return fail(
      "acquire.yaml",
      source,
      cause instanceof Error ? cause.message : String(cause),
    );
  }
};

const parseJsonSource = (contents: string, source: string): JsonValue => {
  try {
    return JSON.parse(contents) as JsonValue;
  } catch (cause) {
    return fail(
      "acquire.json",
      source,
      cause instanceof Error ? cause.message : String(cause),
    );
  }
};

/** Fetch, convert, and write `spec.json` + `spec.provenance.json`. */
export const acquire = async (
  options: AcquireOptions,
): Promise<AcquisitionResult> => {
  const { vendorDir, source } = options;
  const isUrl = source.startsWith("http://") || source.startsWith("https://");
  const raw = isUrl
    ? await (options.fetchText ?? defaultFetchText)(source)
    : existsSync(source)
      ? readFileSync(source, "utf8")
      : fail("acquire.source", source, "source file does not exist");
  const sourceFormat = options.sourceFormat ?? detectFormat(source);

  const specContents =
    sourceFormat === "yaml"
      ? printJson(parseYaml(raw, source))
      : printJson(parseJsonSource(raw, source));

  const fetchedAt = (options.now?.() ?? new Date()).toISOString();
  const provenance: ProvenanceRecord = {
    sourceUrl: source,
    ...(options.upstreamRef === undefined
      ? {}
      : { upstreamRef: options.upstreamRef }),
    fetchedAt,
    contentHash: sha256(specContents),
    sourceFormat,
    ...(sourceFormat === "yaml" ? { sourceContentHash: sha256(raw) } : {}),
  };

  mkdirSync(vendorDir, { recursive: true });
  writeFileSync(join(vendorDir, SPEC_FILE), specContents);
  writeFileSync(
    join(vendorDir, PROVENANCE_FILE),
    printJson(provenance as unknown as JsonValue),
  );
  return {
    vendorDir,
    specFile: SPEC_FILE,
    provenanceFile: PROVENANCE_FILE,
    provenance,
  };
};
