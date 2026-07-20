import type { ClientIr, NamedSchemaIr, ResourceIr } from "./model.ts";
import type { SchemaNode } from "./nodes.ts";

const compare = (left: string, right: string): number =>
  left < right ? -1 : left > right ? 1 : 0;

const collectNamedRefs = (node: SchemaNode, refs: Set<string>): void => {
  switch (node.kind) {
    case "array":
      collectNamedRefs(node.item, refs);
      return;
    case "struct":
      for (const field of node.fields) collectNamedRefs(field.schema, refs);
      return;
    case "record":
      collectNamedRefs(node.key, refs);
      collectNamedRefs(node.value, refs);
      return;
    case "union":
      for (const member of node.members) collectNamedRefs(member, refs);
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

const sortSchemaGroup = (
  schemas: ReadonlyArray<NamedSchemaIr>,
): ReadonlyArray<NamedSchemaIr> => {
  if (new Set(schemas.map((schema) => schema.name)).size !== schemas.length) {
    return [...schemas].sort((left, right) => compare(left.name, right.name));
  }
  const byName = new Map(schemas.map((schema) => [schema.name, schema]));
  const dependencies = new Map<string, Set<string>>();
  const dependents = new Map<string, Set<string>>();

  for (const schema of schemas) {
    const refs = new Set<string>();
    collectNamedRefs(schema.schema, refs);
    const local = new Set([...refs].filter((name) => byName.has(name)));
    dependencies.set(schema.name, local);
    for (const dependency of local) {
      const current = dependents.get(dependency) ?? new Set<string>();
      current.add(schema.name);
      dependents.set(dependency, current);
    }
  }

  const ready = schemas
    .filter((schema) => dependencies.get(schema.name)?.size === 0)
    .map((schema) => schema.name)
    .sort(compare);
  const emitted = new Set<string>();
  const ordered: NamedSchemaIr[] = [];

  while (ready.length > 0) {
    const name = ready.shift()!;
    if (emitted.has(name)) continue;
    emitted.add(name);
    ordered.push(byName.get(name)!);
    for (const dependent of dependents.get(name) ?? []) {
      const remaining = dependencies.get(dependent)!;
      remaining.delete(name);
      if (remaining.size === 0) {
        ready.push(dependent);
        ready.sort(compare);
      }
    }
  }

  ordered.push(
    ...schemas
      .filter((schema) => !emitted.has(schema.name))
      .sort((left, right) => compare(left.name, right.name)),
  );
  return ordered;
};

const sortNamedSchemas = (
  schemas: ReadonlyArray<NamedSchemaIr>,
): ReadonlyArray<NamedSchemaIr> => {
  const groups = new Map<string, NamedSchemaIr[]>();
  for (const schema of schemas) {
    const group = groups.get(schema.group) ?? [];
    group.push(schema);
    groups.set(schema.group, group);
  }
  return [...groups.keys()]
    .sort(compare)
    .flatMap((group) => sortSchemaGroup(groups.get(group)!));
};

const sortResource = (resource: ResourceIr): ResourceIr => ({
  ...resource,
  operations: [...resource.operations]
    .sort((left, right) =>
      compare(left.publicName.method, right.publicName.method),
    )
    .map((operation) => ({
      ...operation,
      errors: [...operation.errors].sort(compare),
    })),
});

export const canonicalize = (ir: ClientIr): ClientIr => ({
  ...ir,
  resources: [...ir.resources]
    .sort((left, right) => compare(left.name, right.name))
    .map(sortResource),
  namedSchemas: sortNamedSchemas(ir.namedSchemas),
  errors: {
    ...ir.errors,
    codeErrors: [...ir.errors.codeErrors].sort((left, right) =>
      compare(left.code, right.code),
    ),
  },
});
