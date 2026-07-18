import { CodegenError, type CodegenViolation } from "../errors.ts";
import type {
  ClientIr,
  CodeErrorIr,
  NamedSchemaIr,
  OperationIr,
} from "./model.ts";
import type { SchemaNode } from "./nodes.ts";

const identifierPattern =
  /^[$_\p{ID_Start}](?:[$_\p{ID_Continue}]|\u{200c}|\u{200d})*$/u;
const fileNamePattern =
  /^[$_\p{ID_Start}](?:[$_\p{ID_Continue}]|\u{200c}|\u{200d})*(?:-[$_\p{ID_Start}](?:[$_\p{ID_Continue}]|\u{200c}|\u{200d})*)*\.ts$/u;

const reservedWords = new Set([
  "await",
  "arguments",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "eval",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "let",
  "new",
  "null",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
]);

const compare = (left: string, right: string): number =>
  left < right ? -1 : left > right ? 1 : 0;

const add = (
  violations: CodegenViolation[],
  rule: string,
  construct: string,
  message: string,
): void => {
  violations.push({ rule, construct, message });
};

const checkUnique = <A>(
  values: ReadonlyArray<A>,
  key: (value: A) => string,
  rule: string,
  construct: (value: A, duplicate: string) => string,
  violations: CodegenViolation[],
): void => {
  const seen = new Set<string>();
  for (const value of values) {
    const candidate = key(value);
    if (seen.has(candidate)) {
      add(
        violations,
        rule,
        construct(value, candidate),
        `duplicate value ${JSON.stringify(candidate)}`,
      );
    }
    seen.add(candidate);
  }
};

const checkIdentifier = (
  value: string,
  construct: string,
  violations: CodegenViolation[],
  options: { readonly allowReserved?: boolean } = {},
): void => {
  if (!identifierPattern.test(value)) {
    add(
      violations,
      "identifier",
      construct,
      `${JSON.stringify(value)} is not a TypeScript identifier`,
    );
  } else if (!options.allowReserved && reservedWords.has(value)) {
    add(
      violations,
      "identifier.reserved",
      construct,
      `${JSON.stringify(value)} is a reserved word`,
    );
  }
};

const checkDocs = (
  docs: string | undefined,
  construct: string,
  violations: CodegenViolation[],
): void => {
  if (docs?.includes("*/")) {
    add(
      violations,
      "docs.comment-terminator",
      construct,
      "documentation contains the block-comment terminator */",
    );
  }
};

const nodeKey = (node: SchemaNode): string => JSON.stringify(node);

const visitNode = (
  node: SchemaNode,
  construct: string,
  violations: CodegenViolation[],
  onRef: (name: string, construct: string) => void,
  allowVoid = false,
): void => {
  switch (node.kind) {
    case "array":
      visitNode(node.item, `${construct}[]`, violations, onRef);
      return;
    case "struct": {
      checkUnique(
        node.fields,
        (entry) => entry.name,
        "struct.field.unique",
        (_entry, name) => `${construct}.${name}`,
        violations,
      );
      for (const entry of node.fields) {
        checkDocs(entry.docs, `${construct}.${entry.name} docs`, violations);
        visitNode(
          entry.schema,
          `${construct}.${entry.name}`,
          violations,
          onRef,
        );
      }
      return;
    }
    case "record":
      visitNode(node.key, `${construct} key`, violations, onRef);
      visitNode(node.value, `${construct} value`, violations, onRef);
      return;
    case "union": {
      if (node.members.length < 2) {
        add(
          violations,
          "union.arity",
          construct,
          "a union must contain at least two members",
        );
      }
      checkUnique(
        node.members,
        nodeKey,
        "union.member.unique",
        () => construct,
        violations,
      );
      for (const member of node.members) {
        visitNode(member, construct, violations, onRef);
      }
      return;
    }
    case "named-ref":
      onRef(node.name, construct);
      return;
    case "void":
      if (!allowVoid) {
        add(
          violations,
          "void.output-only",
          construct,
          "void is only valid as an operation output",
        );
      }
      return;
    case "string":
    case "boolean":
    case "number":
    case "literal":
    case "literals":
    case "secret":
      return;
  }
};

const resolveNode = (
  node: SchemaNode,
  schemas: ReadonlyMap<string, NamedSchemaIr>,
): SchemaNode | undefined =>
  node.kind === "named-ref" ? schemas.get(node.name)?.schema : node;

const resolvePath = (
  start: SchemaNode,
  path: ReadonlyArray<string>,
  schemas: ReadonlyMap<string, NamedSchemaIr>,
): SchemaNode | undefined => {
  let current: SchemaNode | undefined = start;
  for (const segment of path) {
    current = current === undefined ? undefined : resolveNode(current, schemas);
    if (current?.kind !== "struct") return undefined;
    current = current.fields.find((entry) => entry.name === segment)?.schema;
    if (current === undefined) return undefined;
  }
  return current === undefined ? undefined : resolveNode(current, schemas);
};

const checkOperation = (
  operation: OperationIr,
  resourceName: string,
  schemas: ReadonlyMap<string, NamedSchemaIr>,
  errorNames: ReadonlySet<string>,
  violations: CodegenViolation[],
): void => {
  const qualified = `${operation.publicName.resource}.${operation.publicName.method}`;
  const construct = `operation ${qualified}`;
  checkIdentifier(
    operation.publicName.resource,
    `${construct} resource name`,
    violations,
  );
  checkIdentifier(
    operation.publicName.method,
    `${construct} method`,
    violations,
    {
      allowReserved: true,
    },
  );
  checkIdentifier(
    operation.bindingName,
    `${construct} bindingName`,
    violations,
  );
  checkIdentifier(operation.exportName, `${construct} exportName`, violations, {
    allowReserved: true,
  });
  checkIdentifier(operation.inputName, `${construct} inputName`, violations);
  checkIdentifier(operation.errorsName, `${construct} errorsName`, violations);
  checkIdentifier(
    operation.descriptorName,
    `${construct} descriptorName`,
    violations,
  );
  checkDocs(operation.docs, `${construct} docs`, violations);
  checkDocs(operation.errorsDocs, `${construct} errorsDocs`, violations);

  if (operation.publicName.resource !== resourceName) {
    add(
      violations,
      "operation.resource",
      construct,
      `public resource does not match enclosing resource ${JSON.stringify(resourceName)}`,
    );
  }
  if (operation.exportName !== operation.publicName.method) {
    add(
      violations,
      "operation.export-name",
      construct,
      "exportName must equal the public method name",
    );
  }
  if (operation.opId !== qualified) {
    add(
      violations,
      "operation.id",
      construct,
      `opId must equal ${JSON.stringify(qualified)}`,
    );
  }
  if (
    reservedWords.has(operation.publicName.method) &&
    operation.bindingName === operation.publicName.method
  ) {
    add(
      violations,
      "identifier.reserved-binding",
      `${construct} bindingName`,
      "a reserved-word method requires a distinct declaration binding",
    );
  }
  if (
    !(["none", "transient", "throttling"] as const).includes(operation.retry)
  ) {
    add(
      violations,
      "operation.retry",
      construct,
      `unsupported retry disposition ${JSON.stringify(operation.retry)}`,
    );
  }

  const inputNames = new Set(operation.input.fields.map((entry) => entry.name));
  for (const name of operation.pathParams) {
    if (!inputNames.has(name)) {
      add(
        violations,
        "operation.path-param",
        `${construct} pathParams.${name}`,
        "path parameter does not name an input field",
      );
    }
  }
  for (const name of operation.queryParams) {
    if (!inputNames.has(name)) {
      add(
        violations,
        "operation.query-param",
        `${construct} queryParams.${name}`,
        "query parameter does not name an input field",
      );
    }
  }
  for (const key of Object.keys(operation.constantBody ?? {})) {
    if (inputNames.has(key)) {
      add(
        violations,
        "operation.constant-body-collision",
        `${construct} constantBody.${key}`,
        "constant body key collides with an input field",
      );
    }
  }
  for (const error of operation.errors) {
    if (!errorNames.has(error)) {
      add(
        violations,
        "reference.error",
        `${construct} errors.${error}`,
        `error class ${JSON.stringify(error)} does not resolve`,
      );
    }
  }
  checkUnique(
    operation.errors,
    (error) => error,
    "operation.error.unique",
    (_error, name) => `${construct} errors.${name}`,
    violations,
  );

  const onRef = (name: string, refConstruct: string): void => {
    if (!schemas.has(name)) {
      add(
        violations,
        "reference.schema",
        refConstruct,
        `schema ${JSON.stringify(name)} does not resolve`,
      );
    }
  };
  visitNode(operation.input, `${construct} input`, violations, onRef);
  visitNode(operation.output, `${construct} output`, violations, onRef, true);

  if (operation.pagination === undefined) return;
  const paginationConstruct = `${construct} pagination`;
  const pagination = operation.pagination;
  if (!inputNames.has(pagination.cursorParam)) {
    add(
      violations,
      "pagination.cursor-param",
      paginationConstruct,
      `cursor parameter ${JSON.stringify(pagination.cursorParam)} is absent from the input`,
    );
  }
  for (const name of pagination.clear) {
    if (!inputNames.has(name)) {
      add(
        violations,
        "pagination.clear-param",
        paginationConstruct,
        `clear parameter ${JSON.stringify(name)} is absent from the input`,
      );
    }
  }
  if (operation.output.kind === "void") {
    add(
      violations,
      "pagination.output",
      paginationConstruct,
      "void output cannot be paginated",
    );
  } else if (pagination.pageSchema.name !== operation.output.name) {
    add(
      violations,
      "pagination.page-schema",
      paginationConstruct,
      "pageSchema must match the operation output",
    );
  }
  onRef(pagination.pageSchema.name, paginationConstruct);
  onRef(pagination.itemSchema.name, paginationConstruct);
  if (pagination.nextCursorPath.length === 0) {
    add(
      violations,
      "pagination.next-cursor-path",
      paginationConstruct,
      "next cursor path must name at least one field",
    );
  }
  if (pagination.itemsPath.length === 0) {
    add(
      violations,
      "pagination.items-path",
      paginationConstruct,
      "items path must name at least one field",
    );
  }
  if (
    resolvePath(pagination.pageSchema, pagination.nextCursorPath, schemas) ===
    undefined
  ) {
    add(
      violations,
      "pagination.next-cursor-path",
      paginationConstruct,
      `next cursor path ${pagination.nextCursorPath.join(".")} does not resolve`,
    );
  }
  if (
    resolvePath(pagination.pageSchema, pagination.itemsPath, schemas) ===
    undefined
  ) {
    add(
      violations,
      "pagination.items-path",
      paginationConstruct,
      `items path ${pagination.itemsPath.join(".")} does not resolve`,
    );
  }
};

const checkCodeErrorOrder = (
  codeErrors: ReadonlyArray<CodeErrorIr>,
  violations: CodegenViolation[],
): void => {
  const byCode = [...codeErrors].sort((left, right) =>
    compare(left.code, right.code),
  );
  const byClass = [...codeErrors].sort((left, right) =>
    compare(left.className, right.className),
  );
  if (
    byCode.some((entry, index) => entry.className !== byClass[index]?.className)
  ) {
    add(
      violations,
      "error.order-agreement",
      "code-error declarations",
      "code order and class-name order do not agree",
    );
  }
};

export const checkInvariants = (ir: ClientIr): void => {
  const violations: CodegenViolation[] = [];
  checkIdentifier(ir.vendor.prefix, "vendor prefix", violations);
  checkUnique(
    ir.resources,
    (resource) => resource.name,
    "resource.name.unique",
    (_resource, name) => `resource ${name}`,
    violations,
  );
  checkUnique(
    ir.resources,
    (resource) => resource.fileName,
    "resource.file-name.unique",
    (_resource, name) => `resource file ${name}`,
    violations,
  );
  checkUnique(
    ir.namedSchemas,
    (schema) => schema.name,
    "schema.name.unique",
    (_schema, name) => `schema ${name}`,
    violations,
  );
  checkUnique(
    ir.errors.codeErrors,
    (error) => error.code,
    "error.code.unique",
    (_error, code) => `error code ${code}`,
    violations,
  );
  checkUnique(
    [
      ...ir.errors.codeErrors.map((error) => error.className),
      ...ir.errors.coreReexports,
    ],
    (name) => name,
    "error.class-name.unique",
    (_name, name) => `error class ${name}`,
    violations,
  );
  checkCodeErrorOrder(ir.errors.codeErrors, violations);
  checkDocs(ir.errors.docs, "errors docs", violations);
  checkDocs(ir.errors.codeErrorsDocs, "code errors docs", violations);

  const schemas = new Map(
    ir.namedSchemas.map((schema) => [schema.name, schema]),
  );
  const schemaIndexes = new Map(
    ir.namedSchemas.map((schema, index) => [schema.name, index]),
  );
  for (const [index, schema] of ir.namedSchemas.entries()) {
    checkIdentifier(schema.name, `schema ${schema.name} name`, violations);
    checkDocs(schema.docs, `schema ${schema.name} docs`, violations);
    visitNode(
      schema.schema,
      `schema ${schema.name}`,
      violations,
      (name, construct) => {
        const target = schemaIndexes.get(name);
        if (target === undefined) {
          add(
            violations,
            "reference.schema",
            construct,
            `schema ${JSON.stringify(name)} does not resolve`,
          );
        } else if (target >= index) {
          add(
            violations,
            "reference.forward",
            `schema ${schema.name}`,
            `reference to ${JSON.stringify(name)} is not declared earlier`,
          );
        }
      },
    );
  }

  for (const error of ir.errors.codeErrors) {
    checkIdentifier(
      error.className,
      `error ${error.className} className`,
      violations,
    );
    checkIdentifier(error.tag, `error ${error.className} tag`, violations);
    checkDocs(
      error.docsProse,
      `error ${error.className} docsProse`,
      violations,
    );
    if (error.tag !== error.className) {
      add(
        violations,
        "error.tag",
        `error ${error.className}`,
        "tag must equal className",
      );
    }
  }
  for (const name of ir.errors.coreReexports) {
    checkIdentifier(name, `core error ${name}`, violations);
  }

  const operations = ir.resources.flatMap((resource) => resource.operations);
  checkUnique(
    operations,
    (operation) =>
      `${operation.publicName.resource}.${operation.publicName.method}`,
    "operation.public-name.unique",
    (_operation, name) => `operation ${name}`,
    violations,
  );
  checkUnique(
    operations,
    (operation) => operation.opId,
    "operation.id.unique",
    (_operation, id) => `operation id ${id}`,
    violations,
  );
  const errorNames = new Set([
    ...ir.errors.codeErrors.map((error) => error.className),
    ...ir.errors.coreReexports,
  ]);
  for (const resource of ir.resources) {
    checkIdentifier(
      resource.name,
      `resource ${resource.name} name`,
      violations,
    );
    checkDocs(resource.docs, `resource ${resource.name} docs`, violations);
    if (!fileNamePattern.test(resource.fileName)) {
      add(
        violations,
        "identifier.file-name",
        `resource ${resource.name} fileName`,
        `${JSON.stringify(resource.fileName)} is not a safe TypeScript file name`,
      );
    }
    const declarations = new Map<string, string>();
    for (const operation of resource.operations) {
      const qualified = `${operation.publicName.resource}.${operation.publicName.method}`;
      const names = [
        [operation.inputName, `operation ${qualified} inputName`],
        [operation.errorsName, `operation ${qualified} errorsName`],
        [operation.descriptorName, `operation ${qualified} descriptorName`],
        [operation.bindingName, `operation ${qualified} bindingName`],
        ...(operation.pagination === undefined
          ? []
          : [
              [
                `${operation.publicName.method}Pagination`,
                `operation ${qualified} pagination binding`,
              ],
              [
                `${operation.publicName.method}Pages`,
                `operation ${qualified} pages binding`,
              ],
              [
                `${operation.publicName.method}Items`,
                `operation ${qualified} items binding`,
              ],
            ]),
      ] as const;
      for (const [name, construct] of names) {
        const existing = declarations.get(name);
        if (existing !== undefined) {
          add(
            violations,
            "identifier.binding-collision",
            construct,
            `${JSON.stringify(name)} collides with ${existing}`,
          );
        } else {
          declarations.set(name, construct);
        }
      }
      checkOperation(operation, resource.name, schemas, errorNames, violations);
    }
  }

  if (violations.length > 0) throw new CodegenError(violations);
};
