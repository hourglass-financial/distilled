import type { EmittedFile } from "../../emit/shared.ts";
import type { ClientIr, NamedSchemaIr, OperationIr } from "../../ir/model.ts";
import type { SchemaNode } from "../../ir/nodes.ts";
import type { VendorConfig } from "../../ir/vendor-config.ts";
import { generate, type GenerateOptions } from "../../pipeline.ts";
import { normalizeOpenApi } from "./normalize.ts";
import type { JsonValue } from "./json.ts";
import {
  applyPatchesStrict,
  entryTargetPointers,
  type PatchEntry,
  type PatchTargetRole,
  type PatchViolationIdentity,
} from "./patches.ts";
import {
  auditAttestation,
  loadVendorDir,
  type VendorDir,
} from "./vendor-dir.ts";
import { parsePointer } from "./json.ts";
import { CodegenError, type CodegenViolation } from "../../errors.ts";

/**
 * The patch-locality audit (#29, #27 gate 3): every entry's declared blast
 * radius is verified against the actual regeneration diff, symmetrically.
 * For each entry k, the client is generated from the spec with entries
 * [0, k) and again with [0, k]; the changed-file set and the changed-
 * operation set must equal the declaration in both directions, and every
 * change must fall inside the declared target role. Upstream adding a
 * referencing operation therefore breaks loudly instead of widening blast
 * radius silently. Deterministic JSON-out — a Smithers gate surface.
 *
 * The MANIFEST is excluded from the comparison: it changes with any byte by
 * construction and carries no locality signal.
 *
 * Prefixes that do not normalize select repair mode: the entry must declare
 * the exact multiset of `{ rule, construct }` violations it clears, and every
 * edit target must be scoped under one of those constructs. Newly exposed
 * violations are reported for the next entry without failing the current one.
 */

export interface PatchLocalityEntryResult {
  readonly id: string;
  readonly mode: "diff" | "repair";
  readonly role: PatchTargetRole;
  readonly declaredFiles: ReadonlyArray<string>;
  readonly actualFiles: ReadonlyArray<string>;
  /** Declared but unchanged by the regeneration. */
  readonly missingFiles: ReadonlyArray<string>;
  /** Changed by the regeneration but undeclared. */
  readonly unexpectedFiles: ReadonlyArray<string>;
  readonly declaredOperations: ReadonlyArray<string>;
  readonly actualOperations: ReadonlyArray<string>;
  readonly missingOperations: ReadonlyArray<string>;
  readonly unexpectedOperations: ReadonlyArray<string>;
  readonly roleViolations: ReadonlyArray<string>;
  readonly declarationViolations: ReadonlyArray<string>;
  readonly declaredClears: ReadonlyArray<PatchViolationIdentity>;
  readonly actualClears: ReadonlyArray<CodegenViolation>;
  readonly missingClears: ReadonlyArray<PatchViolationIdentity>;
  readonly unexpectedClears: ReadonlyArray<CodegenViolation>;
  readonly exposed: ReadonlyArray<CodegenViolation>;
  readonly targetScopeViolations: ReadonlyArray<string>;
  /** The entry was authored against a different snapshot than the current one. */
  readonly staleAuthorship: boolean;
  readonly ok: boolean;
}

export interface PatchLocalityResult {
  readonly vendorDir: string;
  readonly entries: ReadonlyArray<PatchLocalityEntryResult>;
  readonly ok: boolean;
}

const compare = (left: string, right: string): number =>
  left < right ? -1 : left > right ? 1 : 0;

const qualifiedName = (operation: OperationIr): string =>
  `${operation.publicName.resource}.${operation.publicName.method}`;

const operationsByName = (ir: ClientIr): ReadonlyMap<string, OperationIr> =>
  new Map(
    ir.resources.flatMap((resource) =>
      resource.operations.map((operation) => [
        qualifiedName(operation),
        operation,
      ]),
    ),
  );

const schemasByName = (ir: ClientIr): ReadonlyMap<string, NamedSchemaIr> =>
  new Map(ir.namedSchemas.map((schema) => [schema.name, schema]));

const stringify = (value: unknown): string => JSON.stringify(value);

const collectRefs = (node: SchemaNode, refs: Set<string>): void => {
  switch (node.kind) {
    case "array":
      collectRefs(node.item, refs);
      return;
    case "struct":
      for (const field of node.fields) collectRefs(field.schema, refs);
      return;
    case "record":
      collectRefs(node.key, refs);
      collectRefs(node.value, refs);
      return;
    case "union":
      for (const member of node.members) collectRefs(member, refs);
      return;
    case "named-ref":
      refs.add(node.name);
      return;
    case "string":
    case "boolean":
    case "number":
    case "literal":
    case "literals":
    case "secret":
    case "void":
      return;
  }
};

/** Transitive schema usage, split by request vs response position. */
const schemaUsage = (
  ir: ClientIr,
): {
  readonly request: ReadonlySet<string>;
  readonly response: ReadonlySet<string>;
} => {
  const schemas = schemasByName(ir);
  const close = (seed: ReadonlySet<string>): ReadonlySet<string> => {
    const seen = new Set<string>();
    const queue = [...seed];
    while (queue.length > 0) {
      const name = queue.pop()!;
      if (seen.has(name)) continue;
      seen.add(name);
      const schema = schemas.get(name);
      if (schema === undefined) continue;
      const refs = new Set<string>();
      collectRefs(schema.schema, refs);
      queue.push(...refs);
    }
    return seen;
  };
  const requestSeed = new Set<string>();
  const responseSeed = new Set<string>();
  for (const resource of ir.resources) {
    for (const operation of resource.operations) {
      collectRefs(operation.input, requestSeed);
      collectRefs(operation.output, responseSeed);
    }
  }
  return { request: close(requestSeed), response: close(responseSeed) };
};

interface FacetDiff {
  readonly operations: ReadonlyArray<string>;
  readonly facets: ReadonlySet<PatchTargetRole>;
  readonly notes: ReadonlyArray<string>;
}

/**
 * Which operations and which target-role facets differ between two IRs.
 * Facets mechanically enforce rule 5's request/response separation: a
 * shared-schema change reaching both sides can never satisfy a single
 * declared role and forces the patch to be split or narrowed.
 */
const diffIr = (before: ClientIr, after: ClientIr): FacetDiff => {
  const facets = new Set<PatchTargetRole>();
  const notes: string[] = [];
  const changedOperations = new Set<string>();

  const beforeOps = operationsByName(before);
  const afterOps = operationsByName(after);
  for (const name of new Set([...beforeOps.keys(), ...afterOps.keys()])) {
    const left = beforeOps.get(name);
    const right = afterOps.get(name);
    if (left === undefined || right === undefined) {
      changedOperations.add(name);
      const source = left ?? right!;
      facets.add("request");
      facets.add("response");
      if (source.errors.length > 0) facets.add("error");
      notes.push(
        `operation ${name} was ${left === undefined ? "added" : "removed"}`,
      );
      continue;
    }
    let changed = false;
    if (
      stringify([
        left.input,
        left.pathParams,
        left.queryParams,
        left.pathTemplate,
        left.constantBody,
        left.httpMethod,
      ]) !==
      stringify([
        right.input,
        right.pathParams,
        right.queryParams,
        right.pathTemplate,
        right.constantBody,
        right.httpMethod,
      ])
    ) {
      facets.add("request");
      changed = true;
    }
    if (
      stringify([left.output, left.pagination]) !==
      stringify([right.output, right.pagination])
    ) {
      facets.add("response");
      changed = true;
    }
    if (
      stringify([left.errors, left.retry]) !==
      stringify([right.errors, right.retry])
    ) {
      facets.add("error");
      changed = true;
    }
    if (
      stringify([
        left.docs,
        left.errorsDocs,
        left.publicName,
        left.bindingName,
        left.inputName,
        left.errorsName,
        left.descriptorName,
      ]) !==
      stringify([
        right.docs,
        right.errorsDocs,
        right.publicName,
        right.bindingName,
        right.inputName,
        right.errorsName,
        right.descriptorName,
      ])
    ) {
      facets.add("metadata");
      changed = true;
    }
    if (changed) changedOperations.add(name);
  }

  const beforeSchemas = schemasByName(before);
  const afterSchemas = schemasByName(after);
  const usage = schemaUsage(after);
  const usageBefore = schemaUsage(before);
  const structurallyChangedSchemas = new Set<string>();
  for (const name of new Set([
    ...beforeSchemas.keys(),
    ...afterSchemas.keys(),
  ])) {
    const left = beforeSchemas.get(name);
    const right = afterSchemas.get(name);
    if (stringify(left) === stringify(right)) continue;
    const structuralChange =
      stringify([left?.schema, left?.group]) !==
      stringify([right?.schema, right?.group]);
    if (!structuralChange) {
      facets.add("metadata");
      continue;
    }
    structurallyChangedSchemas.add(name);
    const inRequest = usage.request.has(name) || usageBefore.request.has(name);
    const inResponse =
      usage.response.has(name) || usageBefore.response.has(name);
    if (inRequest) facets.add("request");
    if (inResponse) facets.add("response");
    if (inRequest && inResponse) {
      notes.push(
        `schema ${name} is reachable from both request and response positions; no single role covers it`,
      );
    }
  }

  // A structurally-changed schema affects every operation whose input or
  // output transitively references it — that attribution is what lets a
  // truthfully-enumerated component patch pass symmetrically, and what
  // catches an upstream operation newly referencing a patched schema.
  if (structurallyChangedSchemas.size > 0) {
    for (const ir of [before, after]) {
      const schemas = schemasByName(ir);
      const closure = (node: SchemaNode): ReadonlySet<string> => {
        const seen = new Set<string>();
        const queue: string[] = [];
        collectRefs(node, seen);
        queue.push(...seen);
        while (queue.length > 0) {
          const name = queue.pop()!;
          const schema = schemas.get(name);
          if (schema === undefined) continue;
          const refs = new Set<string>();
          collectRefs(schema.schema, refs);
          for (const ref of refs) {
            if (!seen.has(ref)) {
              seen.add(ref);
              queue.push(ref);
            }
          }
        }
        return seen;
      };
      for (const resource of ir.resources) {
        for (const operation of resource.operations) {
          const reachable = new Set([
            ...closure(operation.input),
            ...closure(operation.output),
          ]);
          for (const name of structurallyChangedSchemas) {
            if (reachable.has(name)) {
              changedOperations.add(qualifiedName(operation));
            }
          }
        }
      }
    }
  }

  if (stringify(before.errors) !== stringify(after.errors)) {
    facets.add("error");
  }
  const clientLevel = (ir: ClientIr): string =>
    stringify([
      ir.vendor,
      ir.packageName,
      ir.baseUrl,
      ir.envVars,
      ir.configErrorMessage,
      ir.serviceTags,
      ir.envelope,
      ir.behavioralCoverageLocation,
      ir.scaffold,
    ]);
  if (clientLevel(before) !== clientLevel(after)) {
    notes.push(
      "client-level identity or scaffold facts changed; no patch role covers that",
    );
  }

  return {
    operations: [...changedOperations].sort(compare),
    facets,
    notes,
  };
};

const changedFiles = (
  before: ReadonlyArray<EmittedFile>,
  after: ReadonlyArray<EmittedFile>,
): ReadonlyArray<string> => {
  const beforeByPath = new Map(
    before.map((file) => [file.path, file.contents]),
  );
  const afterByPath = new Map(after.map((file) => [file.path, file.contents]));
  const changed = new Set<string>();
  for (const path of new Set([...beforeByPath.keys(), ...afterByPath.keys()])) {
    if (path === "MANIFEST") continue;
    if (beforeByPath.get(path) !== afterByPath.get(path)) changed.add(path);
  }
  return [...changed].sort(compare);
};

/**
 * Derive the affected operations of an operation-local entry from its
 * target pointers, using the path template + method registered in either
 * IR generation.
 */
const deriveOperations = (
  entry: PatchEntry,
  before: ClientIr,
  after: ClientIr,
): ReadonlyArray<string> | undefined => {
  const byPathMethod = new Map<string, string>();
  for (const ir of [before, after]) {
    for (const resource of ir.resources) {
      for (const operation of resource.operations) {
        byPathMethod.set(
          `${operation.pathTemplate} ${operation.httpMethod}`,
          qualifiedName(operation),
        );
      }
    }
  }
  const derived = new Set<string>();
  for (const pointer of entryTargetPointers(entry)) {
    const segments = parsePointer(pointer);
    if (segments[0] !== "paths" || segments.length < 3) return undefined;
    const key = `${segments[1]} ${segments[2]!.toUpperCase()}`;
    const name = byPathMethod.get(key);
    if (name === undefined) return undefined;
    derived.add(name);
  }
  return [...derived].sort(compare);
};

const setDifference = (
  left: ReadonlyArray<string>,
  right: ReadonlyArray<string>,
): ReadonlyArray<string> => {
  const rightSet = new Set(right);
  return left.filter((value) => !rightSet.has(value));
};

export interface PatchLocalityOptions {
  readonly generateOptions?: GenerateOptions;
  /** Test seam for proving each prefix is normalized at most once. */
  readonly normalize?: (document: JsonValue, config: VendorConfig) => ClientIr;
}

type PrefixNormalization =
  | {
      readonly normalizable: true;
      readonly ir: ClientIr;
      readonly files: ReadonlyArray<EmittedFile>;
    }
  | {
      readonly normalizable: false;
      readonly violations: ReadonlyArray<CodegenViolation>;
    };

const violationKey = (violation: PatchViolationIdentity): string =>
  JSON.stringify([violation.rule, violation.construct]);

const multisetDifference = <T extends PatchViolationIdentity>(
  left: ReadonlyArray<T>,
  right: ReadonlyArray<PatchViolationIdentity>,
): ReadonlyArray<T> => {
  const remaining = new Map<string, number>();
  for (const violation of right) {
    const key = violationKey(violation);
    remaining.set(key, (remaining.get(key) ?? 0) + 1);
  }
  const difference: T[] = [];
  for (const violation of left) {
    const key = violationKey(violation);
    const count = remaining.get(key) ?? 0;
    if (count === 0) difference.push(violation);
    else remaining.set(key, count - 1);
  }
  return difference;
};

const pointerHasPrefix = (pointer: string, prefix: string): boolean => {
  try {
    const pointerSegments = parsePointer(pointer);
    const prefixSegments = parsePointer(prefix);
    return (
      prefixSegments.length <= pointerSegments.length &&
      prefixSegments.every(
        (segment, index) => segment === pointerSegments[index],
      )
    );
  } catch {
    return false;
  }
};

const repairTargetScopeViolations = (
  entry: PatchEntry,
  clears: ReadonlyArray<PatchViolationIdentity>,
): ReadonlyArray<string> =>
  entryTargetPointers(entry)
    .filter(
      (pointer) =>
        !clears.some((clear) => pointerHasPrefix(pointer, clear.construct)),
    )
    .map(
      (pointer) =>
        `edit target ${JSON.stringify(pointer)} is outside every construct declared in clears`,
    );

/** Run the locality audit for an already-loaded vendor tree. */
export const auditPatchLocalityFrom = (
  vendor: VendorDir,
  options: PatchLocalityOptions = {},
): PatchLocalityResult => {
  const generateOptions = options.generateOptions ?? {};
  const normalize = options.normalize ?? normalizeOpenApi;
  const prefixNormalizations = new Map<number, PrefixNormalization>();
  const normalizePrefix = (
    index: number,
    document: JsonValue,
  ): PrefixNormalization => {
    const cached = prefixNormalizations.get(index);
    if (cached !== undefined) return cached;
    let ir: ClientIr;
    try {
      ir = normalize(document, vendor.config);
    } catch (cause) {
      if (!(cause instanceof CodegenError)) throw cause;
      const outcome: PrefixNormalization = {
        normalizable: false,
        violations: cause.violations,
      };
      prefixNormalizations.set(index, outcome);
      return outcome;
    }
    const outcome: PrefixNormalization = {
      normalizable: true,
      ir,
      files: generate(ir as unknown, generateOptions),
    };
    prefixNormalizations.set(index, outcome);
    return outcome;
  };

  let document: JsonValue = vendor.spec;

  const entries: PatchLocalityEntryResult[] = [];
  for (const [index, entry] of vendor.patches.entries()) {
    const before = normalizePrefix(index, document);
    const nextDocument = applyPatchesStrict(document, [entry]);
    const after = normalizePrefix(index + 1, nextDocument);
    const mode = before.normalizable ? "diff" : "repair";
    const declarationViolations: string[] = [];
    const repairDeclaration = "clears" in entry.blastRadius;

    let declaredFiles: ReadonlyArray<string> = [];
    let actualFiles: ReadonlyArray<string> = [];
    let missingFiles: ReadonlyArray<string> = [];
    let unexpectedFiles: ReadonlyArray<string> = [];
    let declaredOperations: ReadonlyArray<string> = [];
    let actualOperations: ReadonlyArray<string> = [];
    let missingOperations: ReadonlyArray<string> = [];
    let unexpectedOperations: ReadonlyArray<string> = [];
    const roleViolations: string[] = [];
    let declaredClears: ReadonlyArray<PatchViolationIdentity> = [];
    let actualClears: ReadonlyArray<CodegenViolation> = [];
    let missingClears: ReadonlyArray<PatchViolationIdentity> = [];
    let unexpectedClears: ReadonlyArray<CodegenViolation> = [];
    let exposed: ReadonlyArray<CodegenViolation> = [];
    let targetScopeViolations: ReadonlyArray<string> = [];

    if (before.normalizable) {
      if (repairDeclaration) {
        declarationViolations.push(
          "clears is repair-mode-only, but the baseline prefix normalizes",
        );
      }
      if (!after.normalizable) {
        declarationViolations.push(
          "a diff-mode entry made the next prefix non-normalizable",
        );
        exposed = after.violations;
      } else {
        const diff = diffIr(before.ir, after.ir);
        actualFiles = changedFiles(before.files, after.files);
        actualOperations = diff.operations;
        roleViolations.push(...diff.notes);
        for (const facet of diff.facets) {
          if (facet !== entry.blastRadius.role) {
            roleViolations.push(
              `regeneration changed the ${facet} facet, but the declared role is ${JSON.stringify(entry.blastRadius.role)}`,
            );
          }
        }
        if (actualFiles.length === 0) {
          roleViolations.push(
            "the entry has no regeneration effect; remove it or fix its target",
          );
        }
        if (!repairDeclaration) {
          declaredFiles = [...entry.blastRadius.expectedFiles]
            .filter((path) => path !== "MANIFEST")
            .sort(compare);
          const derived = deriveOperations(entry, before.ir, after.ir);
          declaredOperations =
            entry.blastRadius.operations !== undefined
              ? [...entry.blastRadius.operations].sort(compare)
              : (derived ?? []);
          missingFiles = setDifference(declaredFiles, actualFiles);
          unexpectedFiles = setDifference(actualFiles, declaredFiles);
          missingOperations = setDifference(
            declaredOperations,
            actualOperations,
          );
          unexpectedOperations = setDifference(
            actualOperations,
            declaredOperations,
          );
        }
      }
    } else {
      if (!repairDeclaration) {
        declarationViolations.push(
          "expectedFiles/operations are diff-mode-only, but the baseline prefix does not normalize",
        );
      }
      const afterViolations = after.normalizable ? [] : after.violations;
      actualClears = multisetDifference(before.violations, afterViolations);
      exposed = multisetDifference(afterViolations, before.violations);
      if (repairDeclaration) {
        declaredClears = entry.blastRadius.clears;
        missingClears = multisetDifference(declaredClears, actualClears);
        unexpectedClears = multisetDifference(actualClears, declaredClears);
        targetScopeViolations = repairTargetScopeViolations(
          entry,
          declaredClears,
        );
      } else {
        unexpectedClears = actualClears;
      }
    }

    entries.push({
      id: entry.id,
      mode,
      role: entry.blastRadius.role,
      declaredFiles,
      actualFiles,
      missingFiles,
      unexpectedFiles,
      declaredOperations,
      actualOperations,
      missingOperations,
      unexpectedOperations,
      roleViolations,
      declarationViolations,
      declaredClears,
      actualClears,
      missingClears,
      unexpectedClears,
      exposed,
      targetScopeViolations,
      staleAuthorship:
        entry.provenance.authoredAgainstSpecHash !== vendor.specHash,
      ok:
        missingFiles.length === 0 &&
        unexpectedFiles.length === 0 &&
        missingOperations.length === 0 &&
        unexpectedOperations.length === 0 &&
        roleViolations.length === 0 &&
        declarationViolations.length === 0 &&
        missingClears.length === 0 &&
        unexpectedClears.length === 0 &&
        targetScopeViolations.length === 0,
    });

    document = nextDocument;
  }

  return {
    vendorDir: vendor.dir,
    entries,
    ok: entries.every((entry) => entry.ok),
  };
};

export const auditPatchLocality = (
  vendorDir: string,
  options: PatchLocalityOptions = {},
): PatchLocalityResult => {
  const attestation = auditAttestation(vendorDir);
  if (!attestation.ok) {
    throw new CodegenError([
      {
        rule: "attestation.mismatch",
        construct: attestation.specFile,
        message: `snapshot hash ${attestation.actualHash} does not match the provenance record's ${attestation.expectedHash}; the locality audit refuses a tampered snapshot`,
      },
    ]);
  }
  return auditPatchLocalityFrom(loadVendorDir(vendorDir), options);
};
