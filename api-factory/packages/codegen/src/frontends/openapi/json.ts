/**
 * JSON document primitives shared by the patch system and the spec-diff:
 * exact RFC 6901 JSON Pointers, structural deep-equality, and the closed
 * JSON-edit vocabulary patch kinds lower to (`add` / `remove` / `replace`,
 * guarded by `test`-style preconditions). `move`/`copy` are deliberately
 * unsupported — the policed raw hatch is restricted to the same closed set.
 */

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | ReadonlyArray<JsonValue>
  | { readonly [key: string]: JsonValue };

export interface JsonObject {
  readonly [key: string]: JsonValue;
}

export const isJsonObject = (
  value: JsonValue | undefined,
): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const isJsonArray = (
  value: JsonValue | undefined,
): value is ReadonlyArray<JsonValue> => Array.isArray(value);

/** Decode one RFC 6901 pointer into its unescaped segments. */
export const parsePointer = (pointer: string): ReadonlyArray<string> => {
  if (pointer === "") return [];
  if (!pointer.startsWith("/")) {
    throw new Error(`invalid JSON pointer ${JSON.stringify(pointer)}`);
  }
  return pointer
    .slice(1)
    .split("/")
    .map((segment) => segment.replaceAll("~1", "/").replaceAll("~0", "~"));
};

export const escapeSegment = (segment: string): string =>
  segment.replaceAll("~", "~0").replaceAll("/", "~1");

export const formatPointer = (segments: ReadonlyArray<string>): string =>
  segments.map((segment) => `/${escapeSegment(segment)}`).join("");

const arrayIndex = (
  segment: string,
  length: number,
  options: { readonly allowAppend: boolean },
): number | undefined => {
  if (options.allowAppend && segment === "-") return length;
  if (!/^(?:0|[1-9]\d*)$/u.test(segment)) return undefined;
  const index = Number(segment);
  return index > length ? undefined : index;
};

/** Resolve a pointer; `undefined` means the location does not exist. */
export const getAtPointer = (
  document: JsonValue,
  pointer: string,
): JsonValue | undefined => {
  let current: JsonValue | undefined = document;
  for (const segment of parsePointer(pointer)) {
    if (isJsonObject(current)) {
      current = Object.hasOwn(current, segment) ? current[segment] : undefined;
    } else if (isJsonArray(current)) {
      const index = arrayIndex(segment, current.length, { allowAppend: false });
      current = index === undefined ? undefined : current[index];
    } else {
      return undefined;
    }
    if (current === undefined) return undefined;
  }
  return current;
};

export const deepEqual = (left: JsonValue, right: JsonValue): boolean => {
  if (left === right) return true;
  if (isJsonArray(left) && isJsonArray(right)) {
    return (
      left.length === right.length &&
      left.every((value, index) => deepEqual(value, right[index]!))
    );
  }
  if (isJsonObject(left) && isJsonObject(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every(
        (key) =>
          Object.hasOwn(right, key) && deepEqual(left[key]!, right[key]!),
      )
    );
  }
  return false;
};

export interface AddEdit {
  readonly op: "add";
  readonly path: string;
  readonly value: JsonValue;
}

export interface RemoveEdit {
  readonly op: "remove";
  readonly path: string;
}

export interface ReplaceEdit {
  readonly op: "replace";
  readonly path: string;
  readonly value: JsonValue;
}

export type JsonEdit = AddEdit | RemoveEdit | ReplaceEdit;

export class JsonEditError extends Error {
  constructor(
    readonly pointer: string,
    readonly reason:
      | "parent-missing"
      | "target-missing"
      | "target-exists"
      | "bad-index",
    message: string,
  ) {
    super(message);
    this.name = "JsonEditError";
  }
}

const editContainer = (
  document: JsonValue,
  path: string,
): { readonly parent: JsonValue; readonly segment: string } => {
  const segments = parsePointer(path);
  if (segments.length === 0) {
    throw new JsonEditError(
      path,
      "bad-index",
      "the whole-document pointer cannot be edited",
    );
  }
  const parent = getAtPointer(document, formatPointer(segments.slice(0, -1)));
  if (parent === undefined || (!isJsonObject(parent) && !isJsonArray(parent))) {
    throw new JsonEditError(
      path,
      "parent-missing",
      `parent of ${JSON.stringify(path)} does not exist or is not a container`,
    );
  }
  return { parent, segment: segments.at(-1)! };
};

const rebuild = (
  document: JsonValue,
  path: string,
  update: (parent: JsonValue, segment: string) => JsonValue,
): JsonValue => {
  const segments = parsePointer(path);
  const build = (current: JsonValue, depth: number): JsonValue => {
    if (depth === segments.length - 1) return update(current, segments[depth]!);
    const segment = segments[depth]!;
    if (isJsonObject(current)) {
      return { ...current, [segment]: build(current[segment]!, depth + 1) };
    }
    const array = current as ReadonlyArray<JsonValue>;
    const index = arrayIndex(segment, array.length, { allowAppend: false })!;
    return array.map((value, at) =>
      at === index ? build(value, depth + 1) : value,
    );
  };
  return build(document, 0);
};

/**
 * Apply one edit immutably with RFC 6902 semantics plus the Stainless-grade
 * fail-loud invariants: `add` forbids an existing target (append-forbids-
 * existence), `replace` and `remove` require one (update-requires-existence).
 */
export const applyEdit = (document: JsonValue, edit: JsonEdit): JsonValue => {
  const { parent, segment } = editContainer(document, edit.path);
  if (isJsonObject(parent)) {
    const exists = Object.hasOwn(parent, segment);
    if (edit.op === "add" && exists) {
      throw new JsonEditError(
        edit.path,
        "target-exists",
        `add target ${JSON.stringify(edit.path)} already exists`,
      );
    }
    if (edit.op !== "add" && !exists) {
      throw new JsonEditError(
        edit.path,
        "target-missing",
        `${edit.op} target ${JSON.stringify(edit.path)} does not exist`,
      );
    }
    return rebuild(document, edit.path, (container, key) => {
      const object = container as JsonObject;
      if (edit.op === "remove") {
        const { [key]: _removed, ...rest } = object;
        return rest;
      }
      return { ...object, [key]: edit.value };
    });
  }
  const array = parent as ReadonlyArray<JsonValue>;
  const index = arrayIndex(segment, array.length, {
    allowAppend: edit.op === "add",
  });
  if (index === undefined) {
    throw new JsonEditError(
      edit.path,
      "bad-index",
      `${JSON.stringify(segment)} is not a valid index into an array of length ${array.length}`,
    );
  }
  if (edit.op !== "add" && index >= array.length) {
    throw new JsonEditError(
      edit.path,
      "target-missing",
      `${edit.op} target ${JSON.stringify(edit.path)} does not exist`,
    );
  }
  return rebuild(document, edit.path, (container) => {
    const values = container as ReadonlyArray<JsonValue>;
    if (edit.op === "add") {
      return [...values.slice(0, index), edit.value, ...values.slice(index)];
    }
    if (edit.op === "remove") {
      return values.filter((_value, at) => at !== index);
    }
    return values.map((value, at) => (at === index ? edit.value : value));
  });
};

/** Stable serialization for checked-in JSON artifacts: 2-space, trailing newline. */
export const printJson = (value: JsonValue): string =>
  `${JSON.stringify(value, null, 2)}\n`;

/**
 * Own-property record lookup for dynamic keys sourced from specs or vendor
 * config. A bare `record[key]` would resolve prototype members for keys like
 * `"constructor"`, letting spec-supplied data bypass fail-closed gates.
 */
export const ownValue = <T>(
  record: Readonly<Record<string, T>> | undefined,
  key: string,
): T | undefined =>
  record !== undefined && Object.hasOwn(record, key) ? record[key] : undefined;
