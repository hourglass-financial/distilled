import type { CodegenViolation } from "../../errors.ts";
import { reservedWords } from "../../ir/invariants.ts";
import type { OperationNamingOverride } from "../../ir/vendor-config.ts";

/**
 * Naming derivation (#31 §7): fixed engine rules derive resource grouping
 * and public names deterministically; vendor config carries fail-closed
 * overrides for leaked internal codenames and bad derivations. A collision
 * or an underivable name is a hard error demanding an override entry — a
 * heuristic can never silently pick a public name. Naming is a surface
 * concern: the attested snapshot keeps its ugly operationIds.
 */

/** Split an identifier-ish value into lower-case words. */
export const splitWords = (value: string): ReadonlyArray<string> =>
  value
    .replaceAll(/([a-z0-9])([A-Z])/gu, "$1 $2")
    .replaceAll(/([A-Z]+)([A-Z][a-z])/gu, "$1 $2")
    .split(/[^A-Za-z0-9]+/u)
    .filter((word) => word.length > 0)
    .map((word) => word.toLowerCase());

const capitalize = (word: string): string =>
  word.length === 0 ? word : `${word[0]!.toUpperCase()}${word.slice(1)}`;

export const pascalWords = (words: ReadonlyArray<string>): string =>
  words.map(capitalize).join("");

export const camelWords = (words: ReadonlyArray<string>): string => {
  const pascal = pascalWords(words);
  return pascal.length === 0
    ? pascal
    : `${pascal[0]!.toLowerCase()}${pascal.slice(1)}`;
};

/** Human display form: "userManagement" → "User Management". */
export const humanizeWords = (words: ReadonlyArray<string>): string =>
  words.map(capitalize).join(" ");

/** Kebab-case file stem: "userManagement" → "user-management". */
export const kebabWords = (words: ReadonlyArray<string>): string =>
  words.join("-");

/** Naive English singular, sufficient for resource-noun stripping. */
export const singularizeWord = (word: string): string => {
  if (word.endsWith("ies") && word.length > 3) return `${word.slice(0, -3)}y`;
  if (/(?:ses|xes|zes|ches|shes)$/u.test(word)) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
};

const endsWithWords = (
  words: ReadonlyArray<string>,
  suffix: ReadonlyArray<string>,
): boolean =>
  suffix.length > 0 &&
  suffix.length < words.length &&
  suffix.every(
    (word, index) => words[words.length - suffix.length + index] === word,
  );

/**
 * Derived-name hygiene: a derivation that produces a digit-bearing word is
 * refused — that is the leaked-codename signature (`Create0`,
 * `UserlandSessions*`) and only an explicit override may bless such a name.
 */
const hasDigit = (value: string): boolean => /\d/u.test(value);

export interface DerivedOperationNames {
  readonly resource: string;
  readonly method: string;
  readonly bindingName: string;
  readonly inputName: string;
  readonly errorsName: string;
  readonly descriptorName: string;
}

/** The pre-override, pre-rename resource derivation: first tag, else first path segment. */
export const deriveRawResource = (
  tags: ReadonlyArray<string>,
  pathSegments: ReadonlyArray<string>,
): string =>
  camelWords(
    tags.length > 0 ? splitWords(tags[0]!) : splitWords(pathSegments[0] ?? ""),
  );

export interface NamingContext {
  readonly operationId: string;
  readonly pointer: string;
  readonly tags: ReadonlyArray<string>;
  readonly pathSegments: ReadonlyArray<string>;
  readonly resourceRenames: Readonly<Record<string, string>>;
  readonly override: OperationNamingOverride | undefined;
}

/**
 * Derive all public names for one operation, or report why derivation is
 * impossible. Every failure names the construct and the sanctioned fix — a
 * `naming.operations` override entry in the vendor config.
 */
export const deriveOperationNames = (
  context: NamingContext,
  violations: CodegenViolation[],
): DerivedOperationNames | undefined => {
  const construct = `operation ${context.operationId} (${context.pointer})`;
  const override = context.override ?? {};

  const derivedResource = deriveRawResource(context.tags, context.pathSegments);
  const renamed = context.resourceRenames[derivedResource];
  const resource = override.resource ?? renamed ?? derivedResource;
  if (resource.length === 0) {
    violations.push({
      rule: "naming.resource.underivable",
      construct,
      message:
        "no tag or path segment yields a resource name; add a naming.operations override",
    });
    return undefined;
  }
  if (
    override.resource === undefined &&
    renamed === undefined &&
    hasDigit(resource)
  ) {
    violations.push({
      rule: "naming.resource.underivable",
      construct,
      message: `derived resource ${JSON.stringify(resource)} contains a digit (leaked-codename signature); add a naming override`,
    });
    return undefined;
  }

  const idWords = splitWords(context.operationId);
  let methodWords = idWords;
  const finalResourceWords = splitWords(resource);
  const singularResourceWords = finalResourceWords.map(singularizeWord);
  for (const suffix of [finalResourceWords, singularResourceWords]) {
    if (endsWithWords(methodWords, suffix)) {
      methodWords = methodWords.slice(0, methodWords.length - suffix.length);
      break;
    }
  }
  const derivedMethod = camelWords(methodWords);
  const method = override.method ?? derivedMethod;
  if (method.length === 0) {
    violations.push({
      rule: "naming.method.underivable",
      construct,
      message:
        "the operationId reduces to an empty method name; add a naming.operations override",
    });
    return undefined;
  }
  if (override.method === undefined && hasDigit(method)) {
    violations.push({
      rule: "naming.method.underivable",
      construct,
      message: `derived method ${JSON.stringify(method)} contains a digit (leaked-codename signature); add a naming override`,
    });
    return undefined;
  }

  const derivedBinding = reservedWords.has(method)
    ? camelWords(idWords)
    : method;
  const bindingName = override.bindingName ?? derivedBinding;
  if (reservedWords.has(bindingName)) {
    violations.push({
      rule: "naming.binding.reserved",
      construct,
      message: `binding name ${JSON.stringify(bindingName)} is a reserved word; add a bindingName override`,
    });
    return undefined;
  }

  return {
    resource,
    method,
    bindingName,
    inputName: override.inputName ?? `${pascalWords(idWords)}Input`,
    errorsName: override.errorsName ?? `${method}Errors`,
    descriptorName: override.descriptorName ?? `${method}Op`,
  };
};

/**
 * Fail-closed collision check across all resolved names: two operations
 * arriving at the same qualified public name is a hard error naming both
 * operationIds — never a silent pick.
 */
export const checkNameCollisions = (
  resolved: ReadonlyArray<{
    readonly operationId: string;
    readonly qualified: string;
  }>,
  violations: CodegenViolation[],
): void => {
  const byQualified = new Map<string, string[]>();
  for (const entry of resolved) {
    const existing = byQualified.get(entry.qualified) ?? [];
    existing.push(entry.operationId);
    byQualified.set(entry.qualified, existing);
  }
  for (const [qualified, operationIds] of byQualified) {
    if (operationIds.length > 1) {
      violations.push({
        rule: "naming.collision",
        construct: `operation ${qualified}`,
        message: `operationIds ${operationIds
          .map((id) => JSON.stringify(id))
          .join(
            ", ",
          )} all derive the public name ${JSON.stringify(qualified)}; disambiguate with naming.operations overrides`,
      });
    }
  }
};
