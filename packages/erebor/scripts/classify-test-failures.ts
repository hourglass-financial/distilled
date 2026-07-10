#!/usr/bin/env bun
/**
 * Classify Erebor live-test output into the runbook's deterministic triage
 * buckets. Pass a log path or pipe test output on stdin.
 */
import * as fs from "node:fs";

type Bucket =
  | "response_schema_drift"
  | "unknown_error_mapping"
  | "feature_not_enabled"
  | "test_expectation_drift"
  | "timeout_or_environment"
  | "unclassified";

const args = process.argv.slice(2);
const pretty = args.includes("--pretty");
const inputPath = args.find((arg) => !arg.startsWith("--"));

if (args.includes("--help") || args.includes("-h")) {
  console.log(
    [
      "Usage: bun run scripts/classify-test-failures.ts [log-file] [--pretty]",
      "",
      "Reads stdin when log-file is omitted.",
    ].join("\n"),
  );
  process.exit(0);
}

const readStdin = (): string => {
  try {
    return fs.readFileSync(0, "utf-8");
  } catch {
    return "";
  }
};

const text = inputPath ? fs.readFileSync(inputPath, "utf-8") : readStdin();

const evidenceFor = (pattern: RegExp): string[] => {
  const lines = text.split(/\r?\n/);
  const indexes = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => pattern.test(line))
    .map(({ index }) => index);

  const evidence = new Set<string>();
  for (const index of indexes) {
    for (
      let i = Math.max(0, index - 2);
      i <= Math.min(lines.length - 1, index + 2);
      i++
    ) {
      const line = lines[i]?.trim();
      if (line) evidence.add(line);
    }
  }
  return Array.from(evidence).slice(0, 20);
};

const classifiers: Array<{
  bucket: Bucket;
  pattern: RegExp;
  reason: string;
}> = [
  {
    bucket: "response_schema_drift",
    pattern: /EreborParseError|ParseError|decodeUnknown|schema/i,
    reason:
      "A successful response did not match the generated output schema; patch the shared component schema.",
  },
  {
    bucket: "unknown_error_mapping",
    pattern: /UnknownEreborError/i,
    reason:
      "A standard HTTP error fell through to UnknownEreborError; fix client error mapping.",
  },
  {
    bucket: "feature_not_enabled",
    pattern: /EreborFeatureNotEnabled|not enabled|not yet available/i,
    reason:
      "Sandbox credentials hit a permanent feature gate; use the sanctioned typed-error skip pattern.",
  },
  {
    bucket: "test_expectation_drift",
    pattern: /AssertionError|expected .* to(?:Be|Equal|Contain)|toBe\(|toEqual\(/i,
    reason:
      "The live API behavior differs from the assertion; update the test only if the new behavior is valid.",
  },
  {
    bucket: "timeout_or_environment",
    pattern:
      /timeout|ETIMEDOUT|ECONNRESET|ENOTFOUND|EREBOR_API_KEY.*required|EREBOR_API_KEY.*not available|missing.*EREBOR_API_KEY|Cannot find package|ERR_MODULE_NOT_FOUND/i,
    reason:
      "The failure appears environmental or time-bound rather than SDK/spec drift.",
  },
];

const buckets = classifiers
  .map((classifier) => ({
    bucket: classifier.bucket,
    reason: classifier.reason,
    evidence: evidenceFor(classifier.pattern),
  }))
  .filter((entry) => entry.evidence.length > 0);

const result = {
  inputPath: inputPath ?? "stdin",
  classified: buckets.length > 0,
  buckets:
    buckets.length > 0
      ? buckets
      : [
          {
            bucket: "unclassified" as Bucket,
            reason:
              "No known triage signal matched. Stop and inspect the raw failure output before editing.",
            evidence: text
              .split(/\r?\n/)
              .map((line) => line.trim())
              .filter(Boolean)
              .slice(-30),
          },
        ],
};

console.log(JSON.stringify(result, null, pretty ? 2 : 0));
