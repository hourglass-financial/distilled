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
  parsePointer,
  type JsonEdit,
  type JsonObject,
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
 * The machine-checkable locality declaration. A diff-mode entry declares
 * regenerated files and operations; a repair-mode entry declares the exact
 * non-empty multiset of normalizer violations it clears. The audit selects
 * the mode from baseline normalizability and rejects the other declaration.
 */
const ViolationIdentitySchema = Schema.Struct({
  rule: Schema.String,
  construct: Schema.String,
});

export type PatchViolationIdentity = Schema.Schema.Type<
  typeof ViolationIdentitySchema
>;

const BlastRadiusSchema = Schema.Union([
  Schema.Struct({
    role: Schema.Literals(targetRoles),
    operations: Schema.optional(Schema.Array(Schema.String)),
    expectedFiles: Schema.Array(Schema.String),
  }),
  Schema.Struct({
    role: Schema.Literals(targetRoles),
    clears: Schema.NonEmptyArray(ViolationIdentitySchema),
  }),
]);

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
    kind: Schema.Literal("inline-extract"),
    target: Schema.String,
    componentName: Schema.String,
    ...entryCommon,
  }),
  Schema.Struct({
    kind: Schema.Literal("union-collapse"),
    target: Schema.String,
    keep: Schema.Number,
    ...entryCommon,
  }),
  Schema.Struct({
    kind: Schema.Literal("allof-flatten"),
    target: Schema.String,
    ...entryCommon,
  }),
  Schema.Struct({
    kind: Schema.Literal("record-shape"),
    target: Schema.String,
    valueSchema: JsonValueSchema,
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
    case "inline-extract":
    case "union-collapse":
    case "allof-flatten":
    case "record-shape":
      return [entry.target];
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
  | { readonly outcome: "conflicted"; readonly detail: string }
  | { readonly outcome: "unsupported"; readonly detail: string };

const exactBeforeState = (
  entry: PatchEntry,
  target: string,
): JsonValue | undefined =>
  "test" in entry.precondition && entry.precondition.pointer === target
    ? entry.precondition.test
    : undefined;

const hasOnlyKeys = (
  value: JsonObject,
  allowed: ReadonlySet<string>,
): boolean => Object.keys(value).every((key) => allowed.has(key));

const allowedInlineTarget = (pointer: string): boolean => {
  const segments = parsePointer(pointer);
  return (
    segments.at(-1) === "items" ||
    segments.at(-2) === "properties" ||
    (segments.at(-1) === "schema" && segments.at(-3) === "content")
  );
};

type DesiredState =
  | { readonly outcome: "desired"; readonly value: JsonValue }
  | { readonly outcome: "conflicted"; readonly detail: string }
  | { readonly outcome: "unsupported"; readonly detail: string };

const unionPostState = (value: JsonValue, keep: number): DesiredState => {
  if (!Number.isInteger(keep) || keep < 0) {
    return {
      outcome: "unsupported",
      detail: `union keep index ${JSON.stringify(keep)} must be a non-negative integer`,
    };
  }
  if (!isJsonObject(value)) {
    return {
      outcome: "unsupported",
      detail: "union-collapse requires an object-shaped union host",
    };
  }
  if (!hasOnlyKeys(value, new Set(["description", "oneOf", "anyOf"]))) {
    return {
      outcome: "unsupported",
      detail:
        "union-collapse hosts may carry only description and oneOf or anyOf",
    };
  }
  const hasOneOf = value["oneOf"] !== undefined;
  const hasAnyOf = value["anyOf"] !== undefined;
  if (hasOneOf === hasAnyOf) {
    return {
      outcome: "unsupported",
      detail: "union-collapse requires exactly one of oneOf or anyOf",
    };
  }
  const members = value[hasOneOf ? "oneOf" : "anyOf"];
  if (!isJsonArray(members) || keep >= members.length) {
    return {
      outcome: "unsupported",
      detail: `union keep index ${keep} is out of range`,
    };
  }
  return { outcome: "desired", value: members[keep]! };
};

const allOfPostState = (value: JsonValue): DesiredState => {
  if (!isJsonObject(value)) {
    return {
      outcome: "unsupported",
      detail: "allof-flatten requires an object-shaped allOf host",
    };
  }
  if (!hasOnlyKeys(value, new Set(["description", "allOf"]))) {
    return {
      outcome: "unsupported",
      detail: "allof-flatten hosts may carry only description and allOf",
    };
  }
  const members = value["allOf"];
  if (!isJsonArray(members) || members.length === 0) {
    return {
      outcome: "unsupported",
      detail: "allof-flatten requires a non-empty allOf array",
    };
  }
  const properties: Record<string, JsonValue> = {};
  const required: string[] = [];
  const requiredSet = new Set<string>();
  let description: JsonValue | undefined;
  for (const [index, member] of members.entries()) {
    if (!isJsonObject(member) || member["$ref"] !== undefined) {
      return {
        outcome: "unsupported",
        detail: `allOf member ${index} must be an inline object schema; $ref members are not supported`,
      };
    }
    if (
      !hasOnlyKeys(
        member,
        new Set(["type", "description", "properties", "required"]),
      ) ||
      member["type"] !== "object"
    ) {
      return {
        outcome: "unsupported",
        detail: `allOf member ${index} is not a whitelisted inline object schema`,
      };
    }
    const memberProperties = member["properties"];
    if (memberProperties !== undefined && !isJsonObject(memberProperties)) {
      return {
        outcome: "unsupported",
        detail: `allOf member ${index} properties must be an object`,
      };
    }
    for (const [name, property] of Object.entries(memberProperties ?? {})) {
      const existing = properties[name];
      if (existing !== undefined && !deepEqual(existing, property)) {
        return {
          outcome: "conflicted",
          detail: `allOf property ${JSON.stringify(name)} collides with a non-identical schema in member ${index}`,
        };
      }
      if (existing === undefined) properties[name] = property;
    }
    if (member["description"] !== undefined) {
      description = member["description"];
    }
    const memberRequired = member["required"];
    if (
      memberRequired !== undefined &&
      (!isJsonArray(memberRequired) ||
        memberRequired.some((name) => typeof name !== "string"))
    ) {
      return {
        outcome: "unsupported",
        detail: `allOf member ${index} required must be an array of property names`,
      };
    }
    for (const name of memberRequired ?? []) {
      const property = name as string;
      if (!requiredSet.has(property)) {
        requiredSet.add(property);
        required.push(property);
      }
    }
  }
  const flattened: Record<string, JsonValue> = { type: "object" };
  if (value["description"] !== undefined) {
    description = value["description"];
  }
  if (description !== undefined) flattened["description"] = description;
  flattened["properties"] = properties;
  if (required.length > 0) flattened["required"] = required;
  return { outcome: "desired", value: flattened };
};

const recordPostState = (
  value: JsonValue,
  valueSchema: JsonValue,
): DesiredState => {
  if (!isJsonObject(valueSchema)) {
    return {
      outcome: "unsupported",
      detail: "record-shape valueSchema must be an object-shaped schema",
    };
  }
  if (!isJsonObject(value)) {
    return {
      outcome: "unsupported",
      detail: "record-shape requires an object schema target",
    };
  }
  if (
    !hasOnlyKeys(
      value,
      new Set([
        "type",
        "description",
        "patternProperties",
        "additionalProperties",
      ]),
    ) ||
    value["type"] !== "object"
  ) {
    return {
      outcome: "unsupported",
      detail:
        "record-shape targets may carry only type: object, description, and one free-form shape keyword",
    };
  }
  const patternProperties = value["patternProperties"];
  const additionalProperties = value["additionalProperties"];
  if (
    patternProperties !== undefined &&
    (!isJsonObject(patternProperties) || additionalProperties !== undefined)
  ) {
    return {
      outcome: "unsupported",
      detail:
        "record-shape patternProperties must be an object and cannot be combined with additionalProperties",
    };
  }
  if (
    patternProperties === undefined &&
    additionalProperties !== undefined &&
    additionalProperties !== true &&
    !deepEqual(additionalProperties, valueSchema)
  ) {
    return {
      outcome: "conflicted",
      detail:
        "record target already declares a different additionalProperties schema",
    };
  }
  const result: Record<string, JsonValue> = { type: "object" };
  if (value["description"] !== undefined) {
    result["description"] = value["description"]!;
  }
  result["additionalProperties"] = valueSchema;
  return { outcome: "desired", value: result };
};

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
    case "inline-extract": {
      const target = getAtPointer(document, entry.target);
      if (target === undefined) {
        return {
          outcome: "target-missing",
          detail: `inline target ${JSON.stringify(entry.target)} does not exist`,
        };
      }
      if (!allowedInlineTarget(entry.target)) {
        return {
          outcome: "unsupported",
          detail:
            "inline-extract targets must be media-type schemas, array items, or property values",
        };
      }
      const before = exactBeforeState(entry, entry.target);
      if (before === undefined || !isJsonObject(before)) {
        return {
          outcome: "unsupported",
          detail:
            "inline-extract requires an exact value precondition at its target",
        };
      }
      const ref = `#/components/schemas/${entry.componentName}`;
      const desiredTarget: JsonValue = { $ref: ref };
      const componentPointer = `/components/schemas/${escapeSegment(entry.componentName)}`;
      const component = getAtPointer(document, componentPointer);
      if (deepEqual(target, desiredTarget)) {
        return component !== undefined && deepEqual(component, before)
          ? {
              outcome: "already-applied",
              detail: `inline schema is already extracted as ${JSON.stringify(entry.componentName)}`,
            }
          : {
              outcome: "conflicted",
              detail: `inline target references ${JSON.stringify(entry.componentName)}, but the reconstructed component is absent or different`,
            };
      }
      if (isJsonObject(target) && target["$ref"] !== undefined) {
        return Object.keys(target).length > 1
          ? {
              outcome: "unsupported",
              detail:
                "inline-extract rejects $ref schemas carrying sibling keys",
            }
          : {
              outcome: "conflicted",
              detail: "inline-extract target is already a different $ref",
            };
      }
      if (!isJsonObject(target)) {
        return {
          outcome: "unsupported",
          detail: "inline-extract requires an object-shaped inline schema",
        };
      }
      if (component !== undefined) {
        return {
          outcome: "conflicted",
          detail: `component ${JSON.stringify(entry.componentName)} already exists`,
        };
      }
      if (!isJsonObject(getAtPointer(document, "/components/schemas"))) {
        return {
          outcome: "target-missing",
          detail: "components.schemas does not exist",
        };
      }
      return {
        outcome: "lowered",
        edits: [
          { op: "add", path: componentPointer, value: target },
          { op: "replace", path: entry.target, value: desiredTarget },
        ],
      };
    }
    case "union-collapse": {
      const target = getAtPointer(document, entry.target);
      if (target === undefined) {
        return {
          outcome: "target-missing",
          detail: `union target ${JSON.stringify(entry.target)} does not exist`,
        };
      }
      const before = exactBeforeState(entry, entry.target);
      if (before === undefined) {
        return {
          outcome: "unsupported",
          detail:
            "union-collapse requires an exact value precondition at its target",
        };
      }
      const expected = unionPostState(before, entry.keep);
      if (expected.outcome !== "desired") return expected;
      if (deepEqual(target, expected.value)) {
        return {
          outcome: "already-applied",
          detail: `union is already collapsed to member ${entry.keep}`,
        };
      }
      const current = unionPostState(target, entry.keep);
      if (current.outcome !== "desired") return current;
      return {
        outcome: "lowered",
        edits: [{ op: "replace", path: entry.target, value: expected.value }],
      };
    }
    case "allof-flatten": {
      const target = getAtPointer(document, entry.target);
      if (target === undefined) {
        return {
          outcome: "target-missing",
          detail: `allOf target ${JSON.stringify(entry.target)} does not exist`,
        };
      }
      const before = exactBeforeState(entry, entry.target);
      if (before === undefined) {
        return {
          outcome: "unsupported",
          detail:
            "allof-flatten requires an exact value precondition at its target",
        };
      }
      const expected = allOfPostState(before);
      if (expected.outcome !== "desired") return expected;
      if (deepEqual(target, expected.value)) {
        return {
          outcome: "already-applied",
          detail: "allOf is already flattened to the reconstructed object",
        };
      }
      const current = allOfPostState(target);
      if (current.outcome !== "desired") return current;
      return {
        outcome: "lowered",
        edits: [{ op: "replace", path: entry.target, value: expected.value }],
      };
    }
    case "record-shape": {
      const target = getAtPointer(document, entry.target);
      if (target === undefined) {
        return {
          outcome: "target-missing",
          detail: `record target ${JSON.stringify(entry.target)} does not exist`,
        };
      }
      const before = exactBeforeState(entry, entry.target);
      if (before === undefined) {
        return {
          outcome: "unsupported",
          detail:
            "record-shape requires an exact value precondition at its target",
        };
      }
      const expected = recordPostState(before, entry.valueSchema);
      if (expected.outcome !== "desired") return expected;
      if (deepEqual(target, expected.value)) {
        return {
          outcome: "already-applied",
          detail:
            "record target already carries the reconstructed value schema",
        };
      }
      const current = recordPostState(target, entry.valueSchema);
      if (current.outcome !== "desired") return current;
      return {
        outcome: "lowered",
        edits: [{ op: "replace", path: entry.target, value: expected.value }],
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
 * - `unsupported` — the kind's whitelisted lowering cannot reconstruct a
 *   safe desired state, or a raw edit fails outside the typed vocabulary.
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
  if (lowering.outcome === "unsupported") {
    return { classification: "unsupported", detail: lowering.detail };
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

export interface ConfigShadow {
  readonly kind: "schema.docs" | "error.codeProse" | "operation.docs";
  readonly configKey: string;
  readonly specPointer: string;
}

export interface PatchReconciliation {
  readonly document: JsonValue;
  readonly entries: ReadonlyArray<PatchReportEntry>;
  /** Config prose that now shadows prose supplied by the refreshed spec. */
  readonly configShadows: ReadonlyArray<ConfigShadow>;
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
    configShadows: [],
    clean: report.every((entry) => entry.classification === "still_needed"),
  };
};
