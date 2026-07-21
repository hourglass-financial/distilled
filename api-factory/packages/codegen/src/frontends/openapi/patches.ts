import * as Schema from "effect/Schema";
import { CodegenError } from "../../errors.ts";
import {
  applyEdit,
  deepEqual,
  escapeSegment,
  getAtPointer,
  isJsonArray,
  isJsonObject,
  JsonEditError,
  type JsonEdit,
  type JsonValue,
} from "./json.ts";

/**
 * The document-patch system (#29): a closed vocabulary of intent-revealing
 * patch kinds that lower to deterministic JSON edits against the attested L0
 * snapshot, plus a policed raw RFC 6902 escape hatch. One `evaluateEntry`
 * implementation carries the single semantics shared by the applier and the
 * classifier — the predictor/executor drift class of v1's erebor tooling is
 * designed out. Application is fail-closed everywhere; the spec-sync workflow
 * alone may run `applyPatchesReconciling`, whose stale-entry report gates the
 * PR instead of aborting generation.
 */

const JsonValueSchema: Schema.Codec<JsonValue> = Schema.suspend(
  (): Schema.Codec<JsonValue> =>
    Schema.Union([
      Schema.Null,
      Schema.Boolean,
      Schema.Number,
      Schema.String,
      Schema.Array(JsonValueSchema),
      Schema.Record(Schema.String, JsonValueSchema),
    ]),
);

/**
 * The mandatory per-entry guard. Pins the spec'd state the entry was written
 * against, so upstream adopting the fix trips the guard and forces
 * reconciliation instead of silent double-application.
 */
const PreconditionSchema = Schema.Union([
  Schema.Struct({ pointer: Schema.String, test: JsonValueSchema }),
  Schema.Struct({ pointer: Schema.String, absent: Schema.Literal(true) }),
]);

export type PatchPrecondition = Schema.Schema.Type<typeof PreconditionSchema>;

const targetRoles = ["request", "response", "error", "metadata"] as const;

export type PatchTargetRole = (typeof targetRoles)[number];

/**
 * The machine-checkable locality declaration. `operations` lists qualified
 * public names (`resource.method`); it is mandatory for component-path
 * targets and derived (then cross-checked, when declared) for
 * operation-local targets. `expectedFiles` lists client-relative paths the
 * regeneration is expected to touch. The locality gate fails on any
 * asymmetry against the actual regen diff, in either direction.
 */
const BlastRadiusSchema = Schema.Struct({
  role: Schema.Literals(targetRoles),
  operations: Schema.optional(Schema.Array(Schema.String)),
  expectedFiles: Schema.Array(Schema.String),
});

export type PatchBlastRadius = Schema.Schema.Type<typeof BlastRadiusSchema>;

const provenanceCommon = {
  observed: Schema.String,
  specd: Schema.String,
  authoredAgainstSpecHash: Schema.String,
  reporter: Schema.String,
} as const;

/**
 * Structured provenance (#29). Behavior claims (`live-probe`,
 * `debug-capture`) must link a sanitized evidence artifact checked in under
 * `vendors/<vendor>/evidence/`; docs citations carry URL + fetch date.
 */
const ProvenanceSchema = Schema.Union([
  Schema.Struct({
    evidenceType: Schema.Literal("live-probe"),
    endpoint: Schema.String,
    capturedAt: Schema.String,
    evidence: Schema.String,
    ...provenanceCommon,
  }),
  Schema.Struct({
    evidenceType: Schema.Literal("debug-capture"),
    endpoint: Schema.String,
    capturedAt: Schema.String,
    evidence: Schema.String,
    ...provenanceCommon,
  }),
  Schema.Struct({
    evidenceType: Schema.Literal("vendor-docs-citation"),
    url: Schema.String,
    fetchedAt: Schema.String,
    ...provenanceCommon,
  }),
]);

export type PatchProvenance = Schema.Schema.Type<typeof ProvenanceSchema>;

const entryCommon = {
  id: Schema.String,
  rationale: Schema.String,
  precondition: PreconditionSchema,
  blastRadius: BlastRadiusSchema,
  provenance: ProvenanceSchema,
} as const;

const RawOpSchema = Schema.Union([
  Schema.Struct({
    op: Schema.Literals(["add", "replace", "test"] as const),
    path: Schema.String,
    value: JsonValueSchema,
  }),
  Schema.Struct({
    op: Schema.Literal("remove"),
    path: Schema.String,
  }),
]);

export type RawPatchOp = Schema.Schema.Type<typeof RawOpSchema>;

export const PatchEntrySchema = Schema.Union([
  Schema.Struct({
    kind: Schema.Literal("error-response-injection"),
    operationPath: Schema.String,
    status: Schema.String,
    response: JsonValueSchema,
    ...entryCommon,
  }),
  Schema.Struct({
    kind: Schema.Literal("spec-pruning"),
    target: Schema.String,
    ...entryCommon,
  }),
  Schema.Struct({
    kind: Schema.Literal("sensitive-marking"),
    schemaPath: Schema.String,
    ...entryCommon,
  }),
  Schema.Struct({
    kind: Schema.Literal("media-type-fix"),
    contentPath: Schema.String,
    from: Schema.String,
    to: Schema.String,
    ...entryCommon,
  }),
  Schema.Struct({
    kind: Schema.Literal("required-relaxation"),
    schemaPath: Schema.String,
    property: Schema.String,
    ...entryCommon,
  }),
  Schema.Struct({
    kind: Schema.Literal("raw"),
    ops: Schema.Array(RawOpSchema),
    ...entryCommon,
  }),
]);

export type PatchEntry = Schema.Schema.Type<typeof PatchEntrySchema>;

export type PatchKind = PatchEntry["kind"];

const decodeOptions = { errors: "all", onExcessProperty: "error" } as const;

export const decodePatchEntry = (
  input: unknown,
  origin: string,
): PatchEntry => {
  try {
    return Schema.decodeUnknownSync(PatchEntrySchema, decodeOptions)(input);
  } catch (cause) {
    throw new CodegenError([
      {
        rule: "patch.decode",
        construct: `patch ${origin}`,
        message: cause instanceof Error ? cause.message : String(cause),
      },
    ]);
  }
};

/**
 * The static target pointers a kind edits. Drives the component-vs-operation
 * locality rules and the blast-radius derivation; independent of any
 * document state.
 */
export const entryTargetPointers = (
  entry: PatchEntry,
): ReadonlyArray<string> => {
  switch (entry.kind) {
    case "error-response-injection":
      return [
        `${entry.operationPath}/responses/${escapeSegment(entry.status)}`,
      ];
    case "spec-pruning":
      return [entry.target];
    case "sensitive-marking":
      return [entry.schemaPath];
    case "media-type-fix":
      return [
        `${entry.contentPath}/${escapeSegment(entry.from)}`,
        `${entry.contentPath}/${escapeSegment(entry.to)}`,
      ];
    case "required-relaxation":
      return [`${entry.schemaPath}/required`];
    case "raw":
      return entry.ops.map((op) => op.path);
  }
};

export type PatchClassification =
  | "still_needed"
  | "redundant"
  | "stale"
  | "conflict"
  | "unsupported";

export interface PatchEvaluation {
  readonly classification: PatchClassification;
  readonly detail: string;
  /** Present only when the classification is `still_needed`. */
  readonly result?: JsonValue;
}

const preconditionHolds = (
  document: JsonValue,
  precondition: PatchPrecondition,
): { readonly holds: boolean; readonly detail: string } => {
  const actual = getAtPointer(document, precondition.pointer);
  if ("absent" in precondition) {
    return actual === undefined
      ? { holds: true, detail: "" }
      : {
          holds: false,
          detail: `precondition expected ${JSON.stringify(precondition.pointer)} to be absent, but it exists`,
        };
  }
  if (actual === undefined) {
    return {
      holds: false,
      detail: `precondition target ${JSON.stringify(precondition.pointer)} does not exist`,
    };
  }
  return deepEqual(actual, precondition.test)
    ? { holds: true, detail: "" }
    : {
        holds: false,
        detail: `precondition value at ${JSON.stringify(precondition.pointer)} does not match the expected spec'd state`,
      };
};

type LoweringOutcome =
  | { readonly outcome: "lowered"; readonly edits: ReadonlyArray<JsonEdit> }
  | { readonly outcome: "already-applied"; readonly detail: string }
  | { readonly outcome: "target-missing"; readonly detail: string }
  | { readonly outcome: "conflicted"; readonly detail: string };

/**
 * Lower one typed entry to JSON edits against the current document state.
 * Detects the terminal non-applying states a kind can distinguish
 * mechanically: the desired post-state already present (upstream adopted the
 * fix), a vanished target (the spec moved), and a target in a state neither
 * the pre- nor the post-state describes.
 */
const lowerEntry = (
  document: JsonValue,
  entry: Exclude<PatchEntry, { readonly kind: "raw" }>,
): LoweringOutcome => {
  switch (entry.kind) {
    case "error-response-injection": {
      const responsesPointer = `${entry.operationPath}/responses`;
      const targetPointer = `${responsesPointer}/${escapeSegment(entry.status)}`;
      const existing = getAtPointer(document, targetPointer);
      if (existing !== undefined) {
        return deepEqual(existing, entry.response)
          ? {
              outcome: "already-applied",
              detail: `response ${entry.status} already matches the injected value`,
            }
          : {
              outcome: "conflicted",
              detail: `response ${entry.status} already exists with a different value`,
            };
      }
      if (getAtPointer(document, responsesPointer) === undefined) {
        return {
          outcome: "target-missing",
          detail: `operation responses object ${JSON.stringify(responsesPointer)} does not exist`,
        };
      }
      return {
        outcome: "lowered",
        edits: [{ op: "add", path: targetPointer, value: entry.response }],
      };
    }
    case "spec-pruning": {
      if (getAtPointer(document, entry.target) === undefined) {
        return {
          outcome: "already-applied",
          detail: `prune target ${JSON.stringify(entry.target)} is already absent`,
        };
      }
      return {
        outcome: "lowered",
        edits: [{ op: "remove", path: entry.target }],
      };
    }
    case "sensitive-marking": {
      const schema = getAtPointer(document, entry.schemaPath);
      if (schema === undefined || !isJsonObject(schema)) {
        return {
          outcome: "target-missing",
          detail: `schema ${JSON.stringify(entry.schemaPath)} does not exist`,
        };
      }
      const format = schema["format"];
      if (format === "password") {
        return {
          outcome: "already-applied",
          detail: "schema already carries format: password",
        };
      }
      if (format !== undefined) {
        return {
          outcome: "conflicted",
          detail: `schema already declares format ${JSON.stringify(format)}`,
        };
      }
      if (schema["type"] !== "string") {
        return {
          outcome: "conflicted",
          detail: "sensitive-marking targets must be string-typed schemas",
        };
      }
      return {
        outcome: "lowered",
        edits: [
          {
            op: "add",
            path: `${entry.schemaPath}/format`,
            value: "password",
          },
        ],
      };
    }
    case "media-type-fix": {
      const fromPointer = `${entry.contentPath}/${escapeSegment(entry.from)}`;
      const toPointer = `${entry.contentPath}/${escapeSegment(entry.to)}`;
      const fromValue = getAtPointer(document, fromPointer);
      const toValue = getAtPointer(document, toPointer);
      if (fromValue === undefined) {
        return toValue === undefined
          ? {
              outcome: "target-missing",
              detail: `media type ${JSON.stringify(entry.from)} does not exist under ${JSON.stringify(entry.contentPath)}`,
            }
          : {
              outcome: "already-applied",
              detail: `media type ${JSON.stringify(entry.to)} is already present and ${JSON.stringify(entry.from)} is gone`,
            };
      }
      if (toValue !== undefined) {
        return {
          outcome: "conflicted",
          detail: `media type ${JSON.stringify(entry.to)} already exists alongside ${JSON.stringify(entry.from)}`,
        };
      }
      return {
        outcome: "lowered",
        edits: [
          { op: "remove", path: fromPointer },
          { op: "add", path: toPointer, value: fromValue },
        ],
      };
    }
    case "required-relaxation": {
      const schema = getAtPointer(document, entry.schemaPath);
      if (schema === undefined || !isJsonObject(schema)) {
        return {
          outcome: "target-missing",
          detail: `schema ${JSON.stringify(entry.schemaPath)} does not exist`,
        };
      }
      const required = schema["required"];
      if (required === undefined) {
        return {
          outcome: "already-applied",
          detail: `schema declares no required array, so ${JSON.stringify(entry.property)} is already optional`,
        };
      }
      if (!isJsonArray(required)) {
        return {
          outcome: "conflicted",
          detail: "the schema's required member is not an array",
        };
      }
      const index = required.indexOf(entry.property);
      if (index === -1) {
        return {
          outcome: "already-applied",
          detail: `property ${JSON.stringify(entry.property)} is already absent from required`,
        };
      }
      return {
        outcome: "lowered",
        edits: [
          { op: "remove", path: `${entry.schemaPath}/required/${index}` },
        ],
      };
    }
  }
};

/**
 * Raw entries evaluate their ops strictly in sequence with RFC 6902
 * semantics: each `test` guards the document state produced by the ops
 * before it, never the original document.
 */
const evaluateRawEntry = (
  document: JsonValue,
  entry: PatchEntry & { readonly kind: "raw" },
): PatchEvaluation => {
  const precondition = preconditionHolds(document, entry.precondition);
  if (!precondition.holds) {
    return { classification: "conflict", detail: precondition.detail };
  }
  let current = document;
  for (const op of entry.ops) {
    if (op.op === "test") {
      const actual = getAtPointer(current, op.path);
      if (actual === undefined || !deepEqual(actual, op.value)) {
        return {
          classification: "conflict",
          detail: `raw test op at ${JSON.stringify(op.path)} does not hold`,
        };
      }
      continue;
    }
    try {
      current = applyEdit(
        current,
        op.op === "remove"
          ? { op: "remove", path: op.path }
          : { op: op.op, path: op.path, value: op.value },
      );
    } catch (cause) {
      if (!(cause instanceof JsonEditError)) throw cause;
      return {
        classification:
          cause.reason === "target-exists" ? "unsupported" : "stale",
        detail: cause.message,
      };
    }
  }
  return {
    classification: "still_needed",
    detail: "precondition holds and all edits apply",
    result: current,
  };
};

/**
 * The single-semantics evaluation shared by the strict applier, the
 * reconciling applier, and the classifier. Classifications follow the
 * five-way vocabulary promoted from v1's erebor tooling:
 *
 * - `still_needed` — precondition holds and the edits apply; `result` is the
 *   patched document.
 * - `redundant` — the desired post-state is already present (upstream
 *   adopted the fix); applying would double-apply.
 * - `stale` — the entry's target vanished; the spec moved under it.
 * - `conflict` — the target exists but in a state neither the precondition
 *   nor the desired post-state describes.
 * - `unsupported` — only raw entries: the edits fail in a way whose desired
 *   state the classifier cannot reconstruct.
 */
export const evaluateEntry = (
  document: JsonValue,
  entry: PatchEntry,
): PatchEvaluation => {
  if (entry.kind === "raw") {
    return evaluateRawEntry(document, entry);
  }
  const lowering = lowerEntry(document, entry);
  if (lowering.outcome === "already-applied") {
    return { classification: "redundant", detail: lowering.detail };
  }
  if (lowering.outcome === "target-missing") {
    return { classification: "stale", detail: lowering.detail };
  }
  if (lowering.outcome === "conflicted") {
    return { classification: "conflict", detail: lowering.detail };
  }
  const precondition = preconditionHolds(document, entry.precondition);
  if (!precondition.holds) {
    return { classification: "conflict", detail: precondition.detail };
  }
  let current = document;
  for (const edit of lowering.edits) {
    try {
      current = applyEdit(current, edit);
    } catch (cause) {
      if (!(cause instanceof JsonEditError)) throw cause;
      return {
        classification: cause.reason === "target-exists" ? "conflict" : "stale",
        detail: cause.message,
      };
    }
  }
  return {
    classification: "still_needed",
    detail: "precondition holds and all edits apply",
    result: current,
  };
};

export interface PatchReportEntry {
  readonly id: string;
  readonly kind: PatchKind;
  readonly classification: PatchClassification;
  readonly detail: string;
  readonly targets: ReadonlyArray<string>;
  /** Whether the entry was authored against the current snapshot hash. */
  readonly authoredAgainstCurrent: boolean;
}

export interface PatchReconciliation {
  readonly document: JsonValue;
  readonly entries: ReadonlyArray<PatchReportEntry>;
  /** True when every entry is `still_needed` — the PR gate condition. */
  readonly clean: boolean;
}

/**
 * Fail-closed application: the standalone generate path and every regen
 * gate. The first non-applying entry aborts, naming the entry and its
 * classification — v1's warn-and-continue (failure F5) does not exist here.
 */
export const applyPatchesStrict = (
  document: JsonValue,
  entries: ReadonlyArray<PatchEntry>,
): JsonValue => {
  let current = document;
  for (const entry of entries) {
    const evaluation = evaluateEntry(current, entry);
    if (evaluation.classification !== "still_needed") {
      throw new CodegenError([
        {
          rule: "patch.apply",
          construct: `patch ${entry.id}`,
          message: `entry does not apply (${evaluation.classification}): ${evaluation.detail}`,
        },
      ]);
    }
    current = evaluation.result!;
  }
  return current;
};

/**
 * Reconciliation mode — invocable by the spec-sync workflow only. Applying
 * entries are applied; every other classification is skipped and reported.
 * Classification runs against the incrementally-patched document, fixing the
 * intra-file false positive of v1's classifier. The report gates the PR:
 * every non-`still_needed` entry must be removed, retargeted, or
 * re-evidenced before merge.
 */
export const applyPatchesReconciling = (
  document: JsonValue,
  entries: ReadonlyArray<PatchEntry>,
  currentSpecHash: string,
): PatchReconciliation => {
  let current = document;
  const report: PatchReportEntry[] = [];
  for (const entry of entries) {
    const evaluation = evaluateEntry(current, entry);
    if (evaluation.classification === "still_needed") {
      current = evaluation.result!;
    }
    report.push({
      id: entry.id,
      kind: entry.kind,
      classification: evaluation.classification,
      detail: evaluation.detail,
      targets: entryTargetPointers(entry),
      authoredAgainstCurrent:
        entry.provenance.authoredAgainstSpecHash === currentSpecHash,
    });
  }
  return {
    document: current,
    entries: report,
    clean: report.every((entry) => entry.classification === "still_needed"),
  };
};
