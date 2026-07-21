import {
  deepEqual,
  escapeSegment,
  isJsonArray,
  isJsonObject,
  type JsonValue,
} from "./json.ts";

/**
 * Pointer-level spec diff (#29 lifecycle): named deltas at exact JSON
 * Pointers instead of opaque hash pairs, so the reconciliation report can
 * say what moved at each stale entry's target and reconciliation is
 * mechanical. Known OpenAPI shapes are classified semantically
 * (parameter-added, type-changed, required-entry-removed, …); everything
 * else is a structural added/removed/changed entry.
 */

export type SpecDiffChange = "added" | "removed" | "changed";

export type SpecDiffClassification =
  | "parameter-added"
  | "parameter-removed"
  | "type-changed"
  | "required-entry-added"
  | "required-entry-removed"
  | "operation-added"
  | "operation-removed"
  | "response-added"
  | "response-removed"
  | "schema-added"
  | "schema-removed"
  | "enum-changed"
  | "structural";

export interface SpecDiffEntry {
  readonly pointer: string;
  readonly change: SpecDiffChange;
  readonly classification: SpecDiffClassification;
  readonly before?: JsonValue;
  readonly after?: JsonValue;
}

const httpMethods = new Set([
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
  "trace",
]);

const isIndex = (segment: string): boolean => /^\d+$/u.test(segment);

const classify = (
  segments: ReadonlyArray<string>,
  change: SpecDiffChange,
): SpecDiffClassification => {
  const last = segments.at(-1) ?? "";
  const parent = segments.at(-2) ?? "";
  if (last === "type" && change === "changed") return "type-changed";
  if (parent === "required" && isIndex(last) && change !== "changed") {
    return change === "removed"
      ? "required-entry-removed"
      : "required-entry-added";
  }
  if (parent === "enum" || last === "enum") return "enum-changed";
  if (parent === "parameters" && isIndex(last) && change !== "changed") {
    return change === "removed" ? "parameter-removed" : "parameter-added";
  }
  if (parent === "responses" && change !== "changed") {
    return change === "removed" ? "response-removed" : "response-added";
  }
  if (
    segments.length === 3 &&
    segments[0] === "paths" &&
    httpMethods.has(last) &&
    change !== "changed"
  ) {
    return change === "removed" ? "operation-removed" : "operation-added";
  }
  if (
    segments.length === 3 &&
    segments[0] === "components" &&
    segments[1] === "schemas" &&
    change !== "changed"
  ) {
    return change === "removed" ? "schema-removed" : "schema-added";
  }
  return "structural";
};

const push = (
  entries: SpecDiffEntry[],
  segments: ReadonlyArray<string>,
  change: SpecDiffChange,
  before: JsonValue | undefined,
  after: JsonValue | undefined,
): void => {
  entries.push({
    pointer: segments.map((segment) => `/${escapeSegment(segment)}`).join(""),
    change,
    classification: classify(segments, change),
    ...(before === undefined ? {} : { before }),
    ...(after === undefined ? {} : { after }),
  });
};

const isScalar = (value: JsonValue): boolean =>
  value === null || typeof value !== "object";

/**
 * LCS-aligned diff for all-scalar arrays (`required`, `enum`, tag lists):
 * a front insertion or removal names the one moved entry instead of
 * cascading a spurious "changed" delta across every following index.
 * Removed entries carry before-indices; added entries carry after-indices.
 */
const diffScalarArrays = (
  before: ReadonlyArray<JsonValue>,
  after: ReadonlyArray<JsonValue>,
  segments: ReadonlyArray<string>,
  entries: SpecDiffEntry[],
): void => {
  const lengths: number[][] = Array.from({ length: before.length + 1 }, () =>
    new Array<number>(after.length + 1).fill(0),
  );
  for (let i = before.length - 1; i >= 0; i -= 1) {
    for (let j = after.length - 1; j >= 0; j -= 1) {
      lengths[i]![j] =
        before[i] === after[j]
          ? lengths[i + 1]![j + 1]! + 1
          : Math.max(lengths[i + 1]![j]!, lengths[i]![j + 1]!);
    }
  }
  let i = 0;
  let j = 0;
  while (i < before.length && j < after.length) {
    if (before[i] === after[j]) {
      i += 1;
      j += 1;
    } else if (lengths[i + 1]![j]! >= lengths[i]![j + 1]!) {
      push(entries, [...segments, String(i)], "removed", before[i]!, undefined);
      i += 1;
    } else {
      push(entries, [...segments, String(j)], "added", undefined, after[j]!);
      j += 1;
    }
  }
  for (; i < before.length; i += 1) {
    push(entries, [...segments, String(i)], "removed", before[i]!, undefined);
  }
  for (; j < after.length; j += 1) {
    push(entries, [...segments, String(j)], "added", undefined, after[j]!);
  }
};

const walk = (
  before: JsonValue,
  after: JsonValue,
  segments: ReadonlyArray<string>,
  entries: SpecDiffEntry[],
): void => {
  if (deepEqual(before, after)) return;
  if (isJsonObject(before) && isJsonObject(after)) {
    const keys = [
      ...new Set([...Object.keys(before), ...Object.keys(after)]),
    ].sort();
    for (const key of keys) {
      const next = [...segments, key];
      const hasBefore = Object.hasOwn(before, key);
      const hasAfter = Object.hasOwn(after, key);
      if (hasBefore && hasAfter) {
        walk(before[key]!, after[key]!, next, entries);
      } else if (hasBefore) {
        push(entries, next, "removed", before[key]!, undefined);
      } else {
        push(entries, next, "added", undefined, after[key]!);
      }
    }
    return;
  }
  if (isJsonArray(before) && isJsonArray(after)) {
    if (before.every(isScalar) && after.every(isScalar)) {
      diffScalarArrays(before, after, segments, entries);
      return;
    }
    const shared = Math.min(before.length, after.length);
    for (let index = 0; index < shared; index += 1) {
      walk(
        before[index]!,
        after[index]!,
        [...segments, String(index)],
        entries,
      );
    }
    for (let index = shared; index < before.length; index += 1) {
      push(
        entries,
        [...segments, String(index)],
        "removed",
        before[index]!,
        undefined,
      );
    }
    for (let index = shared; index < after.length; index += 1) {
      push(
        entries,
        [...segments, String(index)],
        "added",
        undefined,
        after[index]!,
      );
    }
    return;
  }
  push(entries, segments, "changed", before, after);
};

export interface SpecDiff {
  readonly identical: boolean;
  readonly entries: ReadonlyArray<SpecDiffEntry>;
}

/** Diff two JSON documents into pointer-level, classified deltas. */
export const diffSpecs = (before: JsonValue, after: JsonValue): SpecDiff => {
  const entries: SpecDiffEntry[] = [];
  walk(before, after, [], entries);
  return { identical: entries.length === 0, entries };
};
