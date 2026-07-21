import type { ClientIr } from "../ir/model.ts";
import type { FieldIr, SchemaNode } from "../ir/nodes.ts";
import { ImportCollector } from "./imports.ts";
import {
  banner,
  CORE_PACKAGE,
  createWriter,
  emitted,
  type EmittedFile,
  finishWriter,
  schemaSection,
  stringLiteral,
  writeDoc,
} from "./shared.ts";

export const hasSecret = (node: SchemaNode): boolean => {
  switch (node.kind) {
    case "secret":
      return true;
    case "array":
      return hasSecret(node.item);
    case "struct":
      return node.fields.some((field) => hasSecret(field.schema));
    case "record":
      return hasSecret(node.key) || hasSecret(node.value);
    case "union":
      return node.members.some(hasSecret);
    case "string":
    case "boolean":
    case "number":
    case "json":
    case "literal":
    case "literals":
    case "void":
    case "named-ref":
      return false;
  }
};

const literalValue = (value: string | number | boolean): string =>
  typeof value === "string" ? stringLiteral(value) : String(value);

export const emitSchemaNode = (node: SchemaNode): string => {
  switch (node.kind) {
    case "string":
      return "Schema.String";
    case "boolean":
      return "Schema.Boolean";
    case "number":
      return "Schema.Number";
    case "json":
      // Schema.Json identity-decodes any valid JSON and rejects non-JSON prototypes.
      return "Schema.Json";
    case "literal":
      return `Schema.Literal(${literalValue(node.value)})`;
    case "literals":
      return `Schema.Literals([${node.values.map(literalValue).join(", ")}])`;
    case "array":
      return `Schema.Array(${emitSchemaNode(node.item)})`;
    case "struct":
      return `Schema.Struct({ ${node.fields.map(emitField).join(", ")} })`;
    case "record":
      return `Schema.Record(${emitSchemaNode(node.key)}, ${emitSchemaNode(node.value)})`;
    case "union":
      return `Schema.Union([${node.members.map(emitSchemaNode).join(", ")}])`;
    case "secret":
      return "Secret";
    case "void":
      return "Schema.Void";
    case "named-ref":
      return node.name;
  }
};

const propertyName = (name: string): string =>
  name === "__proto__"
    ? `[${stringLiteral(name)}]`
    : /^[$A-Z_a-z][$\w]*$/u.test(name)
      ? name
      : stringLiteral(name);

export const emitField = (field: FieldIr): string => {
  let schema = emitSchemaNode(field.schema);
  if (field.nullable) schema = `Schema.NullOr(${schema})`;
  if (field.optional) schema = `Schema.optional(${schema})`;
  return `${propertyName(field.name)}: ${schema}`;
};

const schemasBanner = (ir: ClientIr): string =>
  banner(
    [
      `wire shapes → the ${ir.vendor.display} OpenAPI spec + the generator's schema mapping`,
      `redaction / decoding behavior → ${CORE_PACKAGE}`,
    ],
    `Wire field names are kept verbatim (snake_case) for 1:1 fidelity with the\n${ir.vendor.display} API; secret fields are typed through core's \`Secret\` so tokens decode\nto \`Redacted<string>\` and never print.`,
  );

export const emitSchemas = (ir: ClientIr): EmittedFile => {
  const imports = new ImportCollector();
  imports.use("effect/Schema", "Schema", { namespace: true });
  if (ir.namedSchemas.some((schema) => hasSecret(schema.schema))) {
    imports.use(CORE_PACKAGE, "Secret");
  }
  const writer = createWriter();
  writer.writeLine(schemasBanner(ir));
  writer.writeLine(imports.render());
  let group: string | undefined;
  for (const schema of ir.namedSchemas) {
    if (schema.group !== group) {
      writer.blankLine().writeLine(schemaSection(schema.group)).blankLine();
      group = schema.group;
    } else {
      writer.blankLine();
    }
    writeDoc(writer, schema.docs);
    writer.writeLine(
      `export const ${schema.name} = ${emitSchemaNode(schema.schema)};`,
    );
    writer.writeLine(
      `export interface ${schema.name} extends Schema.Schema.Type<typeof ${schema.name}> {}`,
    );
  }
  return emitted("src/schemas.ts", finishWriter(writer));
};
